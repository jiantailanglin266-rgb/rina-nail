import { MapPin, MessageCircle, Phone } from "lucide-react";

import { fallbackContact } from "@/data/booking/config";
import { localeHref, routes } from "@/data/navigation";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";

type Props = {
  locale: Locale;
  messages: Messages;
  /** 開発中のみ、設定の不備を具体的に表示します */
  developerHint?: string;
};

/**
 * 予約URLが未設定・不正なときの表示。
 *
 * 空のiframeや壊れたボタンを出さず、**代わりの連絡手段**を示します。
 * 技術的なメッセージは本番では出しません（お客様には意味がなく、不安を与えるため）。
 * 開発中だけ、何が足りないかを画面に出します。
 */
export function BookingUnavailable({ locale, messages, developerHint }: Props) {
  const text = messages.booking.notConfigured;
  const contact = fallbackContact();

  return (
    <div className="gradient-frame glass-card rounded-3xl p-6 text-center sm:p-10">
      <span className="bg-soft-lilac text-purple mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full">
        <MessageCircle className="size-7" aria-hidden="true" />
      </span>

      <h2 className="font-display text-xl sm:text-2xl">{text.heading}</h2>
      <p className="text-muted mx-auto mt-3 max-w-md text-sm leading-relaxed">{text.lead}</p>

      <div className="mt-7 flex flex-col items-center gap-3">
        {/* 電話番号は設定済みのときだけ出します（空の tel: リンクを作らないため） */}
        {contact.telHref ? (
          <a
            href={contact.telHref}
            className="btn-sheen inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full text-sm font-medium text-white [background-image:var(--gradient-button)]"
          >
            <Phone className="size-4" aria-hidden="true" />
            {text.callUs}
          </a>
        ) : null}

        <a
          href={localeHref(locale, routes.access.path)}
          className="border-line hover:border-purple inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full border bg-white text-sm transition"
        >
          <MapPin className="size-4" aria-hidden="true" />
          {text.viewAccess}
        </a>
      </div>

      {/*
        開発中のみ表示します。
        本番ビルドではこの分岐に値が渡らないため、お客様の画面には出ません。
      */}
      {developerHint ? (
        <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-3 text-left text-xs text-amber-900">
          {developerHint}
        </p>
      ) : null}
    </div>
  );
}
