import { CalendarCheck, Sparkles } from "lucide-react";

import { localeHref, routes } from "@/data/navigation";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";
import { withBasePath } from "@/lib/base-path";
import { bookingLink } from "@/lib/booking";

type Props = {
  locale: Locale;
  messages: Messages;
};

/**
 * モバイル画面下部に固定する予約導線。
 * ページ内のどこからでも1タップで予約に進めるようにしています。
 */
export function FloatingBookingButton({ locale, messages }: Props) {
  const booking = bookingLink(locale);

  return (
    <div className="border-line fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur-xl lg:hidden">
      <div className="container-page flex items-center gap-2 py-3">
        <a
          // 生の <a> は next/link と違い basePath が自動で付かないため、明示的に付けます
          href={withBasePath(localeHref(locale, routes.menu.path))}
          className="border-line text-ink inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-2 py-3 text-[0.7rem] leading-tight font-medium whitespace-nowrap"
        >
          <Sparkles className="text-gold size-4 shrink-0" aria-hidden="true" />
          {messages.common.viewCoupons}
        </a>
        <a
          href={booking.external ? booking.href : withBasePath(booking.href)}
          className="btn-sheen relative inline-flex flex-[1.3] items-center justify-center gap-1.5 overflow-hidden rounded-full [background-image:var(--gradient-button)] px-2 py-3 text-[0.7rem] leading-tight font-medium whitespace-nowrap text-white"
          {...(booking.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <CalendarCheck className="size-4 shrink-0" aria-hidden="true" />
          {messages.common.book}
        </a>
      </div>
    </div>
  );
}
