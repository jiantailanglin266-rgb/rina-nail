"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CalendarCheck, Check, Loader2 } from "lucide-react";

import { BookingSteps } from "@/components/booking/BookingSteps";
import { DatePicker } from "@/components/booking/DatePicker";
import { visibleMenus, visibleOptions, findMenu } from "@/data/booking/menus";
import { staffMembers } from "@/data/booking/settings";
import { formatPrice } from "@/data/menu";
import { localeHref, routes } from "@/data/navigation";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";
import { interpolate } from "@/i18n/interpolate";
import {
  buildSlots,
  totalPrice,
  treatmentMinutes,
  type BusyPeriod,
  type TimeSlot,
} from "@/lib/booking/availability";
import {
  BookingError,
  createBooking,
  createIdempotencyKey,
  fetchAvailability,
  type BookingErrorCode,
} from "@/lib/booking/api";
import { trackBookingEvent } from "@/lib/booking/analytics";
import { validateBookingForm, errorCodeOf, type BookingForm, type FieldError } from "@/lib/booking/validate";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
  messages: Messages;
};

type StepId = "menu" | "options" | "staff" | "datetime" | "info" | "confirm" | "done";

const EMPTY_FORM: BookingForm = {
  name: "",
  kana: "",
  phone: "",
  email: "",
  needsOff: "none",
  visitType: "first",
  contactPreference: "email",
  agreeTerms: false,
  agreeCancel: false,
  agreePrivacy: false,
};

/**
 * 予約のステップフォーム。
 *
 * ページ遷移ではなく1画面のステップ形式にしています。
 * 静的サイトのため、ページを移動すると選択内容が失われるうえ、
 * スマートフォンでは戻る操作で入力が消える事故が起きやすいためです。
 *
 * 空き状況の計算はブラウザ側でも行いますが、**確定の判断は必ずサーバー側**です。
 * 画面を開いてから確定するまでの間に他の方が予約する可能性があるためです。
 */
export function BookingFlow({ locale, messages }: Props) {
  const text = messages.booking;
  const menus = visibleMenus();
  const options = visibleOptions();
  const showStaffStep = staffMembers.length > 1;

  const steps: StepId[] = useMemo(
    () =>
      showStaffStep
        ? ["menu", "options", "staff", "datetime", "info", "confirm"]
        : ["menu", "options", "datetime", "info", "confirm"],
    [showStaffStep],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [optionIds, setOptionIds] = useState<string[]>([]);
  const [staffId, setStaffId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [busy, setBusy] = useState<BusyPeriod[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldError[]>([]);
  /*
   * エラーは2種類に分けて持ちます。
   * - apiError: 予約確定の失敗（例:「ちょうど埋まりました」）
   * - slotsError: 空き状況の取得失敗
   * 1つにまとめると、確定失敗で日時選択へ戻したときに
   * 空き状況の再取得がエラー表示を消してしまい、
   * **理由が分からないまま戻される**ことになります（実際にそうなっていました）。
   */
  const [apiError, setApiError] = useState<BookingErrorCode | null>(null);
  const [slotsError, setSlotsError] = useState<BookingErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ reservationId: string } | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  /** 二重送信を防ぐ鍵。同じ内容の送信では作り直しません */
  const idempotencyKey = useRef<string>(createIdempotencyKey());

  const currentStep: StepId = result ? "done" : steps[stepIndex];

  // ステップが変わったら見出しへフォーカスを移し、読み上げと視線を合わせます
  useEffect(() => {
    headingRef.current?.focus();
  }, [stepIndex, result]);

  useEffect(() => {
    trackBookingEvent("booking_step_view", { step: currentStep });
  }, [currentStep]);

  /** 選択した日の空き状況をサーバーから取得します */
  const loadAvailability = useCallback(
    async (target: string) => {
      setLoadingSlots(true);
      setSlotsError(null);
      try {
        const data = await fetchAvailability({ date: target, staffId });
        setBusy(data.busy);
      } catch (error) {
        setBusy([]);
        setSlotsError(error instanceof BookingError ? error.code : "unknown");
      } finally {
        setLoadingSlots(false);
      }
    },
    [staffId],
  );

  const slots = useMemo(() => {
    if (!date || !menuId) return [];
    return buildSlots({ date, menuId, optionIds, busy, now: new Date(), staffId });
  }, [date, menuId, optionIds, busy, staffId]);

  const price = menuId ? totalPrice(menuId, optionIds) : null;
  const duration = menuId ? treatmentMinutes(menuId, optionIds) : 0;

  function goNext() {
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function goBack() {
    setApiError(null);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }

  /** 日時を選び直したら、確定時のエラー表示は役目を終えます */
  function chooseSlot(item: TimeSlot) {
    setSlot(item);
    setApiError(null);
  }

  function toggleOption(id: string) {
    setOptionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    // 所要時間が変わると選べる枠も変わるため、選択済みの時間を解除します
    setSlot(null);
  }

  function updateForm<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submitInfo() {
    const found = validateBookingForm(form);
    setErrors(found);
    if (found.length === 0) {
      trackBookingEvent("booking_form_complete");
      goNext();
    }
  }

  async function confirm() {
    if (!menuId || !slot || submitting) return;

    setSubmitting(true);
    setApiError(null);
    try {
      const created = await createBooking({
        menuId,
        optionIds,
        staffId,
        startIso: slot.startIso,
        form,
        locale,
        idempotencyKey: idempotencyKey.current,
      });
      trackBookingEvent("booking_complete", { menu: menuId });
      setResult({ reservationId: created.reservationId });
    } catch (error) {
      const code = error instanceof BookingError ? error.code : "unknown";
      setApiError(code);
      // 枠が埋まっていた場合は、日時選択へ戻して選び直していただきます
      if (code === "slotTaken" || code === "dailyLimit" || code === "tooSoon") {
        setSlot(null);
        if (date) void loadAvailability(date);
        setStepIndex(steps.indexOf("datetime"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- 表示 ---------- */

  const stepLabels = steps.map((id) => text.steps[id]);

  if (result) {
    return (
      <div className="gradient-frame glass-card rounded-3xl p-6 text-center sm:p-10">
        <span className="bg-purple/10 text-purple mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl outline-none">
          {text.done.heading}
        </h2>
        <p className="text-muted mt-3 text-sm leading-relaxed">{text.done.lead}</p>

        <dl className="border-line mt-6 rounded-2xl border bg-white p-4 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{text.done.reservationId}</dt>
            <dd className="font-medium">{result.reservationId}</dd>
          </div>
        </dl>

        <p className="text-muted mt-4 text-xs">{text.done.manageNote}</p>

        <a
          href={localeHref(locale, routes.home.path)}
          className="text-purple mt-6 inline-block text-sm underline underline-offset-4"
        >
          {text.done.backToTop}
        </a>
      </div>
    );
  }

  return (
    <div>
      <BookingSteps
        labels={stepLabels}
        current={stepIndex}
        stepOfLabel={interpolate(text.stepOf, { current: stepIndex + 1, total: steps.length })}
      />

      <div className="gradient-frame glass-card mt-6 rounded-3xl p-5 sm:p-8">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-xl outline-none sm:text-2xl"
        >
          {text.steps[currentStep]}
        </h2>

        {[apiError, slotsError].filter(Boolean).map((code) => (
          <p
            key={code}
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{text.api[code as BookingErrorCode]}</span>
          </p>
        ))}

        {/* 1. メニュー */}
        {currentStep === "menu" ? (
          <div className="mt-5">
            <p className="text-muted text-sm">{text.lead}</p>
            <ul className="mt-4 space-y-2">
              {menus.map((menu) => {
                const info = text.menus[menu.id as keyof typeof text.menus];
                const selected = menuId === menu.id;
                return (
                  <li key={menu.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuId(menu.id);
                        setSlot(null);
                        trackBookingEvent("booking_menu_select", { menu: menu.id });
                        goNext();
                      }}
                      aria-pressed={selected}
                      className={cn(
                        "w-full rounded-2xl border p-4 text-left transition",
                        selected ? "border-purple bg-purple/5" : "border-line hover:border-purple bg-white",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-medium">{info.name}</span>
                        <span className="text-purple shrink-0 text-sm font-medium">
                          {menu.price === null
                            ? text.priceUndecided
                            : `${formatPrice(menu.price, locale)}${menu.from ? "〜" : ""}`}
                        </span>
                      </div>
                      <p className="text-muted mt-1 text-xs leading-relaxed">{info.description}</p>
                      <p className="text-muted mt-1 text-[0.7rem]">
                        {menu.durationMinutes}
                        {locale === "ja" ? "分" : " min"}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {/* 2. オプション */}
        {currentStep === "options" ? (
          <div className="mt-5">
            <p className="text-muted text-sm">{text.optionsLead}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {options.map((option) => {
                const selected = optionIds.includes(option.id);
                return (
                  <li key={option.id}>
                    <label
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl border p-3 text-sm transition",
                        selected ? "border-purple bg-purple/5" : "border-line bg-white",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleOption(option.id)}
                        className="accent-purple size-4 shrink-0"
                      />
                      <span className="flex-1">{text.options[option.id as keyof typeof text.options]}</span>
                      <span className="text-muted shrink-0 text-xs">
                        {option.price === null
                          ? ""
                          : `+${formatPrice(option.price, locale)}${option.from ? "〜" : ""}`}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {/* 3. 担当（スタッフが2名以上のときだけ表示） */}
        {currentStep === "staff" ? (
          <div className="mt-5">
            <p className="text-muted text-sm">{text.staffLead}</p>
            <ul className="mt-4 space-y-2">
              {[{ id: "", name: text.staffAny }, ...staffMembers].map((member) => (
                <li key={member.id || "any"}>
                  <button
                    type="button"
                    onClick={() => {
                      setStaffId(member.id || undefined);
                      setSlot(null);
                      goNext();
                    }}
                    className="border-line hover:border-purple min-h-11 w-full rounded-2xl border bg-white p-4 text-left transition"
                  >
                    {member.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* 4. 日時 */}
        {currentStep === "datetime" ? (
          <div className="mt-5">
            <p className="text-muted text-sm">{text.dateLead}</p>
            <div className="mt-4">
              <DatePicker
                messages={messages}
                locale={locale}
                value={date}
                onSelect={(selected) => {
                  setDate(selected);
                  setSlot(null);
                  trackBookingEvent("booking_date_select");
                  void loadAvailability(selected);
                }}
              />
            </div>

            {date ? (
              <div className="mt-6">
                <p className="text-muted text-sm">{text.timeLead}</p>

                {loadingSlots ? (
                  <p className="text-muted mt-3 flex items-center gap-2 text-sm">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    {text.loadingSlots}
                  </p>
                ) : slots.filter((s) => s.available).length === 0 ? (
                  <p className="text-muted mt-3 text-sm">{text.noSlots}</p>
                ) : (
                  <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((item) => (
                      <li key={item.time}>
                        <button
                          type="button"
                          disabled={!item.available}
                          onClick={() => chooseSlot(item)}
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
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* 5. お客様情報 */}
        {currentStep === "info" ? (
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitInfo();
            }}
          >
            <p className="text-muted text-sm">{text.infoLead}</p>

            {errors.length > 0 ? (
              <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {text.errors.fixFields}
              </p>
            ) : null}

            <Field id="name" label={text.fields.name} required text={text} errors={errors}>
              <input
                id="name"
                value={form.name}
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder={text.placeholders.name}
                autoComplete="name"
                className={inputClass}
              />
            </Field>

            <Field id="kana" label={text.fields.kana} required text={text} errors={errors}>
              <input
                id="kana"
                value={form.kana}
                onChange={(e) => updateForm("kana", e.target.value)}
                placeholder={text.placeholders.kana}
                className={inputClass}
              />
            </Field>

            <Field id="phone" label={text.fields.phone} required text={text} errors={errors}>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                placeholder={text.placeholders.phone}
                autoComplete="tel"
                className={inputClass}
              />
            </Field>

            <Field id="email" label={text.fields.email} required text={text} errors={errors}>
              <input
                id="email"
                type="email"
                inputMode="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                placeholder={text.placeholders.email}
                autoComplete="email"
                className={inputClass}
              />
            </Field>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">{text.fields.needsOff}</legend>
              <div className="flex flex-wrap gap-2">
                {(["none", "own", "other"] as const).map((value) => (
                  <label
                    key={value}
                    className={cn(
                      "min-h-11 cursor-pointer rounded-full border px-4 py-2.5 text-xs",
                      form.needsOff === value ? "border-purple bg-purple/5" : "border-line bg-white",
                    )}
                  >
                    <input
                      type="radio"
                      name="needsOff"
                      className="sr-only"
                      checked={form.needsOff === value}
                      onChange={() => updateForm("needsOff", value)}
                    />
                    {text.off[value]}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field id="design" label={text.fields.design} text={text} errors={errors}>
              <textarea
                id="design"
                rows={2}
                value={form.design ?? ""}
                onChange={(e) => updateForm("design", e.target.value)}
                placeholder={text.placeholders.design}
                className={inputClass}
              />
            </Field>

            <Field id="note" label={text.fields.note} text={text} errors={errors}>
              <textarea
                id="note"
                rows={2}
                value={form.note ?? ""}
                onChange={(e) => updateForm("note", e.target.value)}
                placeholder={text.placeholders.note}
                className={inputClass}
              />
            </Field>

            <div className="border-line space-y-3 rounded-2xl border bg-white p-4">
              {(
                [
                  ["agreeTerms", text.agree.terms, routes.terms.path],
                  ["agreeCancel", text.agree.cancel, routes.firstVisit.path],
                  ["agreePrivacy", text.agree.privacy, routes.privacy.path],
                ] as const
              ).map(([key, label, path]) => (
                <label key={key} className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => updateForm(key, e.target.checked)}
                    aria-invalid={errorCodeOf(errors, key) ? true : undefined}
                    className="accent-purple mt-0.5 size-4 shrink-0"
                  />
                  <span>
                    {label}
                    <a
                      href={localeHref(locale, path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple ml-2 text-xs underline underline-offset-2"
                    >
                      {text.agree.readMore}
                    </a>
                  </span>
                </label>
              ))}
            </div>

            <button type="submit" className={primaryButtonClass}>
              {text.next}
            </button>
          </form>
        ) : null}

        {/* 6. 確認 */}
        {currentStep === "confirm" && menuId && slot ? (
          <div className="mt-5">
            <p className="text-muted text-sm">{text.confirmLead}</p>

            <dl className="border-line mt-4 divide-y rounded-2xl border bg-white text-sm">
              <Row label={text.steps.menu} value={text.menus[menuId as keyof typeof text.menus].name} />
              <Row
                label={text.steps.options}
                value={
                  optionIds.length === 0
                    ? text.optionsSkip
                    : optionIds
                        .map((id) => text.options[id as keyof typeof text.options])
                        .join(" / ")
                }
              />
              <Row label={text.selectedDateTime} value={`${date} ${slot.time}`} />
              <Row
                label={text.totalDuration}
                value={`${duration}${locale === "ja" ? "分" : " min"}`}
              />
              <Row
                label={text.totalPrice}
                value={
                  price?.hasUndecided
                    ? text.priceUndecided
                    : `${formatPrice(price?.total ?? 0, locale)}${price?.isFrom ? "〜" : ""}`
                }
              />
              <Row label={text.fields.name} value={form.name} />
              <Row label={text.fields.phone} value={form.phone} />
              <Row label={text.fields.email} value={form.email} />
            </dl>

            <button
              type="button"
              onClick={confirm}
              disabled={submitting}
              className={cn(primaryButtonClass, "mt-5")}
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {text.submitting}
                </>
              ) : (
                <>
                  <CalendarCheck className="size-4" aria-hidden="true" />
                  {text.confirmAndBook}
                </>
              )}
            </button>
          </div>
        ) : null}

        {/* 進む・戻る */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className="border-line hover:border-purple min-h-11 rounded-full border px-5 text-sm transition disabled:opacity-30"
          >
            {text.back}
          </button>

          {currentStep === "options" || currentStep === "datetime" ? (
            <button
              type="button"
              onClick={goNext}
              disabled={currentStep === "datetime" && !slot}
              className={cn(primaryButtonClass, "w-auto px-6")}
            >
              {text.next}
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 部品 ---------- */

const inputClass =
  "border-line focus:border-purple w-full rounded-xl border px-4 py-3 text-sm outline-none";

const primaryButtonClass =
  "btn-sheen inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-medium text-white transition disabled:opacity-50 [background-image:var(--gradient-button)]";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 p-3">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function Field({
  id,
  label,
  required,
  text,
  errors,
  children,
}: {
  id: keyof BookingForm;
  label: string;
  required?: boolean;
  text: Messages["booking"];
  errors: FieldError[];
  children: React.ReactNode;
}) {
  const code = errorCodeOf(errors, id);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-sm font-medium">
        {label}
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[0.6rem]",
            required ? "bg-purple/10 text-purple" : "bg-line/60 text-muted",
          )}
        >
          {required ? text.required : text.optional}
        </span>
      </label>
      {children}
      {code ? (
        // 色だけでなく文言でも誤りを伝えます
        <p role="alert" className="mt-1.5 text-xs text-red-700">
          {text.errors[code as keyof typeof text.errors]}
        </p>
      ) : null}
    </div>
  );
}

/** メニューが存在するかの確認（不正なIDが入った場合の保険） */
export function isKnownMenu(id: string): boolean {
  return Boolean(findMenu(id));
}
