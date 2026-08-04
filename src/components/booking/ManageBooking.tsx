"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AlertCircle, CalendarClock, Check, Loader2, XCircle } from "lucide-react";

import { DatePicker } from "@/components/booking/DatePicker";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";
import {
  buildSlots,
  type BusyPeriod,
  type TimeSlot,
} from "@/lib/booking/availability";
import {
  BookingError,
  cancelBooking,
  createIdempotencyKey,
  fetchAvailability,
  fetchReservation,
  rescheduleBooking,
  type BookingErrorCode,
  type ReservationSummary,
} from "@/lib/booking/api";
import { trackBookingEvent } from "@/lib/booking/analytics";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
  messages: Messages;
};

type Phase = "loading" | "ready" | "rescheduling" | "cancelled" | "rescheduled" | "error";

/**
 * 予約の確認・変更・キャンセル。
 *
 * URLの `?token=` から予約を特定します。
 * トークンはサーバー側で署名を検証しており、予約IDだけでは操作できません
 * （推測してのアクセスを防ぐためです）。
 *
 * 静的サイトのためURLの読み取りはブラウザ側で行いますが、
 * **トークンの正当性の判断はサーバー側だけ**が行います。
 */
export function ManageBooking({ locale, messages }: Props) {
  const text = messages.booking;
  /*
   * URLの ?token= を読み取ります。
   *
   * 効果（useEffect）の中で直接 setState すると再描画が連鎖するため、
   * 外部の値を読む用途の useSyncExternalStore を使います。
   * サーバー側では空文字を返すので、静的書き出しでも安全です。
   */
  const search = useSyncExternalStore(subscribeToUrl, getSearch, getServerSearch);
  const token = new URLSearchParams(search).get("token");

  const [phase, setPhase] = useState<Phase>("loading");
  const [reservation, setReservation] = useState<ReservationSummary | null>(null);
  const [errorCode, setErrorCode] = useState<BookingErrorCode | null>(null);

  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [busy, setBusy] = useState<BusyPeriod[]>([]);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    fetchReservation(token)
      .then((data) => {
        if (cancelled) return;
        setReservation(data);
        setPhase(data.status === "cancelled" ? "cancelled" : "ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorCode(error instanceof BookingError ? error.code : "unknown");
        setPhase("error");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const loadAvailability = useCallback(async (target: string) => {
    try {
      const data = await fetchAvailability({ date: target });
      setBusy(data.busy);
    } catch {
      setBusy([]);
    }
  }, []);

  async function submitReschedule() {
    if (!token || !slot || working) return;
    setWorking(true);
    setErrorCode(null);
    try {
      await rescheduleBooking({
        token,
        startIso: slot.startIso,
        idempotencyKey: createIdempotencyKey(),
      });
      trackBookingEvent("booking_reschedule");
      setPhase("rescheduled");
    } catch (error) {
      setErrorCode(error instanceof BookingError ? error.code : "unknown");
    } finally {
      setWorking(false);
    }
  }

  async function submitCancel() {
    if (!token || working) return;
    if (!window.confirm(text.manage.cancelConfirm)) return;

    setWorking(true);
    setErrorCode(null);
    try {
      await cancelBooking({ token, idempotencyKey: createIdempotencyKey() });
      trackBookingEvent("booking_cancel");
      setPhase("cancelled");
    } catch (error) {
      setErrorCode(error instanceof BookingError ? error.code : "unknown");
    } finally {
      setWorking(false);
    }
  }

  const slots =
    date && reservation
      ? buildSlots({
          date,
          menuId: reservation.menuId,
          optionIds: reservation.optionIds,
          busy,
          now: new Date(),
        })
      : [];

  // トークンが無い場合は通信せずに案内します
  if (!token) {
    return (
      <div className="gradient-frame glass-card rounded-3xl p-8 text-center">
        <AlertCircle className="mx-auto mb-3 size-8 text-red-500" aria-hidden="true" />
        <p className="text-sm leading-relaxed">{text.manage.noToken}</p>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <p className="text-muted flex items-center justify-center gap-2 py-12 text-sm">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {text.manage.loading}
      </p>
    );
  }

  if (phase === "error") {
    return (
      <div className="gradient-frame glass-card rounded-3xl p-8 text-center">
        <AlertCircle className="mx-auto mb-3 size-8 text-red-500" aria-hidden="true" />
        <p className="text-sm leading-relaxed">
          {errorCode ? text.api[errorCode] : text.manage.noToken}
        </p>
      </div>
    );
  }

  if (phase === "cancelled" || phase === "rescheduled") {
    return (
      <div className="gradient-frame glass-card rounded-3xl p-8 text-center">
        <span className="bg-purple/10 text-purple mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed">
          {phase === "cancelled" ? text.manage.cancelled : text.manage.rescheduled}
        </p>
      </div>
    );
  }

  return (
    <div className="gradient-frame glass-card rounded-3xl p-5 sm:p-8">
      <h2 className="font-display text-xl">{text.manage.current}</h2>

      {errorCode ? (
        <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {text.api[errorCode]}
        </p>
      ) : null}

      {reservation ? (
        <dl className="border-line mt-4 divide-y rounded-2xl border bg-white text-sm">
          <div className="flex justify-between gap-4 p-3">
            <dt className="text-muted">{text.done.reservationId}</dt>
            <dd>{reservation.reservationId}</dd>
          </div>
          <div className="flex justify-between gap-4 p-3">
            <dt className="text-muted">{text.selectedDateTime}</dt>
            <dd>
              {new Intl.DateTimeFormat(locale, {
                dateStyle: "long",
                timeStyle: "short",
                timeZone: "Asia/Tokyo",
              }).format(new Date(reservation.startIso))}
            </dd>
          </div>
          <div className="flex justify-between gap-4 p-3">
            <dt className="text-muted">{text.steps.menu}</dt>
            <dd>{text.menus[reservation.menuId as keyof typeof text.menus]?.name ?? reservation.menuId}</dd>
          </div>
        </dl>
      ) : null}

      {phase === "ready" ? (
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setPhase("rescheduling")}
            className="border-line hover:border-purple inline-flex min-h-12 items-center justify-center gap-2 rounded-full border bg-white px-6 text-sm transition"
          >
            <CalendarClock className="size-4" aria-hidden="true" />
            {text.manage.reschedule}
          </button>
          <button
            type="button"
            onClick={submitCancel}
            disabled={working}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-6 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            <XCircle className="size-4" aria-hidden="true" />
            {text.manage.cancel}
          </button>
        </div>
      ) : null}

      {phase === "rescheduling" ? (
        <div className="mt-6">
          <p className="text-muted text-sm">{text.dateLead}</p>
          <div className="mt-4">
            <DatePicker
              messages={messages}
              locale={locale}
              value={date}
              onSelect={(selected) => {
                setDate(selected);
                setSlot(null);
                void loadAvailability(selected);
              }}
            />
          </div>

          {date ? (
            <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((item) => (
                <li key={item.time}>
                  <button
                    type="button"
                    disabled={!item.available}
                    onClick={() => setSlot(item)}
                    aria-pressed={slot?.time === item.time}
                    className={cn(
                      "min-h-11 w-full rounded-xl border text-sm transition",
                      slot?.time === item.time
                        ? "border-transparent text-white [background-image:var(--gradient-button)]"
                        : item.available
                          ? "border-line hover:border-purple bg-white"
                          : "border-line/50 text-muted/40 cursor-not-allowed bg-white line-through",
                    )}
                  >
                    {item.time}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <button
            type="button"
            onClick={submitReschedule}
            disabled={!slot || working}
            className="btn-sheen mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-medium text-white transition disabled:opacity-50 [background-image:var(--gradient-button)]"
          >
            {working ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {text.manage.reschedule}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- URLの読み取り（useSyncExternalStore 用） ---------- */

function subscribeToUrl(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function getSearch(): string {
  return window.location.search;
}

/** サーバー側（静的書き出し時）は空。描画後にブラウザ側の値へ切り替わります */
function getServerSearch(): string {
  return "";
}
