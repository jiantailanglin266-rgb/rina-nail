"use client";

import { useState, type CSSProperties } from "react";
import { ArrowUpRight, CalendarClock, Loader2 } from "lucide-react";

import { bookingEmbedUrl, bookingFrameHeight, bookingPageUrl } from "@/data/booking/config";
import type { Messages } from "@/i18n/dictionary";
import { trackBookingEvent } from "@/lib/booking/analytics";

type Props = {
  messages: Messages;
};

/**
 * Googleカレンダーの予約スケジュールを埋め込みます。
 *
 * ## この画面の中身はGoogleのものです
 *
 * iframe の中は別ドメイン（calendar.google.com）です。
 * ブラウザの決まりにより、**中身をCSSで変えることも、JavaScriptで読むこともできません。**
 * そのため次のことは行いません（行えません）。
 *
 * - iframe内のデザイン変更
 * - 予約完了の検知
 *
 * 予約が完了したかどうかは、Googleから届く確認メールが唯一の確定情報です。
 * サイト側で「予約できたはず」と推測して表示することはしません。
 *
 * ## 表示できないときのために
 *
 * 埋め込みが表示されない環境（ブラウザの制限・通信不良・JavaScript無効）でも
 * 予約できるよう、**別タブで開くリンクを常に表示**しています。
 * これは読み込みに失敗したときだけ出すのではなく、最初から見える場所に置いています。
 */
export function GoogleBookingCalendar({ messages }: Props) {
  const text = messages.booking;
  const embedUrl = bookingEmbedUrl();
  const pageUrl = bookingPageUrl();
  const [loaded, setLoaded] = useState(false);

  // URLが未設定・不正なときは、呼び出し側で準備中の案内に切り替えます
  if (!embedUrl || !pageUrl) return null;

  return (
    <div>
      <div className="gradient-frame bg-soft-lilac/30 relative overflow-hidden rounded-3xl p-2 sm:p-3">
        {/* 読み込み中の表示。文字でも状態を伝えます（読み上げ・低速回線対策） */}
        {!loaded ? (
          <div
            role="status"
            className="absolute inset-2 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white sm:inset-3"
          >
            <Loader2 className="text-purple size-6 animate-spin" aria-hidden="true" />
            <p className="text-muted text-sm">{text.loading}</p>
          </div>
        ) : null}

        <iframe
          src={embedUrl}
          title={text.frameTitle}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          // Googleの画面に必要な最小限だけを許可します
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer-when-downgrade"
          /*
           * 高さは設定ファイル（bookingFrameHeight）の値をCSS変数で渡し、
           * 画面幅による切り替えは globals.css のメディアクエリで行います。
           * 固定値だけに頼らず clamp を使うのは、Google側の画面が
           * 日付選択→時間選択→入力フォームと進むにつれて縦に伸びるためです。
           * 低すぎるとiframe内に二重スクロールが生まれ、スマートフォンで非常に操作しづらくなります。
           */
          style={
            {
              "--booking-frame-mobile": bookingFrameHeight.mobile,
              "--booking-frame-desktop": bookingFrameHeight.desktop,
            } as CSSProperties
          }
          className="booking-frame w-full rounded-2xl border-0 bg-white"
        />
      </div>

      {/*
        フォールバック導線。
        埋め込みが表示されない場合の逃げ道であり、
        「Googleの画面で完結する」ことを明示する役割も持たせています。
      */}
      <div className="mt-4 text-center">
        <p className="text-muted text-xs leading-relaxed">{text.fallbackLead}</p>
        <a
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackBookingEvent("click_booking_fallback")}
          className="border-line hover:border-purple text-ink mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border bg-white px-6 text-sm transition"
        >
          <CalendarClock className="size-4" aria-hidden="true" />
          {text.fallbackButton}
          {/* 別タブで開くことを、アイコンだけでなく読み上げにも伝えます */}
          <ArrowUpRight className="size-4" aria-hidden="true" />
          <span className="sr-only">{text.openInNewTab}</span>
        </a>
      </div>
    </div>
  );
}
