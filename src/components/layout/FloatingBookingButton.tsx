"use client";

import { usePathname } from "next/navigation";
import { CalendarCheck, Sparkles } from "lucide-react";

import { localeHref, routes } from "@/data/navigation";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";
import { withBasePath } from "@/lib/base-path";
import { bookingLink } from "@/lib/booking";
import { trackBookingEvent } from "@/lib/booking/analytics";

type Props = {
  locale: Locale;
  messages: Messages;
};

/**
 * モバイル画面下部に固定する予約導線。
 *
 * - **予約ページの上では出しません。** すでに予約画面があるところに
 *   同じボタンを重ねても邪魔になるだけで、Googleカレンダーの操作面積も奪います。
 * - iPhoneのホームバー（セーフエリア）ぶんの余白を確保します。
 * - 高さを抑え、閉じる操作が要らない大きさにしています。
 */
export function FloatingBookingButton({ locale, messages }: Props) {
  const booking = bookingLink(locale);
  const pathname = usePathname();

  // 予約ページでは非表示（basePath が付く場合も考慮して部分一致で判定します）
  if (pathname?.includes(routes.booking.path)) return null;

  return (
    <div
      // ホームバーに重ならないよう、下端にセーフエリアぶんの余白を足します
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      className="border-line fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur-xl lg:hidden"
    >
      <div className="container-page flex items-center gap-2 py-3">
        <a
          // 生の <a> は next/link と違い basePath が自動で付かないため、明示的に付けます
          href={withBasePath(localeHref(locale, routes.menu.path))}
          className="border-line text-ink inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full border px-2 text-[0.7rem] leading-tight font-medium whitespace-nowrap"
        >
          <Sparkles className="text-gold size-4 shrink-0" aria-hidden="true" />
          {messages.common.viewCoupons}
        </a>
        <a
          href={booking.external ? booking.href : withBasePath(booking.href)}
          onClick={() => trackBookingEvent("click_booking_button", { location: "floating_bar" })}
          className="btn-sheen relative inline-flex min-h-11 flex-[1.3] items-center justify-center gap-1.5 overflow-hidden rounded-full px-2 text-[0.7rem] leading-tight font-medium whitespace-nowrap text-white [background-image:var(--gradient-button)]"
          {...(booking.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <CalendarCheck className="size-4 shrink-0" aria-hidden="true" />
          {messages.booking.cta}
        </a>
      </div>
    </div>
  );
}
