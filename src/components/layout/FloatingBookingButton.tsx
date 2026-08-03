import { CalendarCheck, Sparkles } from "lucide-react";

import { localeHref, routes } from "@/data/navigation";
import { links } from "@/data/site";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";

type Props = {
  locale: Locale;
  messages: Messages;
};

/**
 * モバイル画面下部に固定する予約導線。
 * ページ内のどこからでも1タップで予約に進めるようにしています。
 */
export function FloatingBookingButton({ locale, messages }: Props) {
  return (
    <div className="border-line fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur-xl lg:hidden">
      <div className="container-page flex items-center gap-2 py-3">
        <a
          href={localeHref(locale, routes.menu.path)}
          className="border-line text-ink inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-2 py-3 text-[0.7rem] leading-tight font-medium whitespace-nowrap"
        >
          <Sparkles className="text-gold size-4 shrink-0" aria-hidden="true" />
          {messages.common.viewCoupons}
        </a>
        <a
          href={links.booking}
          className="btn-sheen relative inline-flex flex-[1.3] items-center justify-center gap-1.5 overflow-hidden rounded-full [background-image:var(--gradient-signature)] px-2 py-3 text-[0.7rem] leading-tight font-medium whitespace-nowrap text-white"
          {...(links.booking.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          <CalendarCheck className="size-4 shrink-0" aria-hidden="true" />
          {messages.common.book}
        </a>
      </div>
    </div>
  );
}
