import { localeHref, routes } from "@/data/navigation";
import { isPlaceholder, links } from "@/data/site";
import type { Locale } from "@/i18n/config";

export type BookingLink = {
  href: string;
  /** 外部サイトを開くか（サイト内の予約ページなら false） */
  external: boolean;
  /** 予約導線が使える状態か */
  isConfigured: boolean;
};

/**
 * 予約CTAのリンク先を1か所で決めます。
 *
 * サイト内に予約ページ（`/booking`）があるため、**既定はそこへ送ります**。
 * 予約ページの中で、Googleカレンダーの予約画面を表示します。
 * Google予約URLが未設定でも、予約ページには準備中の案内と連絡先が出るので、
 * ボタンが行き止まりになることはありません。
 *
 * ホットペッパー等の外部予約サイトURL（`NEXT_PUBLIC_BOOKING_URL`）が
 * 設定されている場合だけ、そちらを優先します。
 *
 * 新しく予約CTAを追加するときも、必ずこの関数を使ってください。
 */
export function bookingLink(locale: Locale): BookingLink {
  if (!isPlaceholder(links.booking)) {
    return { href: links.booking, external: true, isConfigured: true };
  }

  return {
    href: localeHref(locale, routes.booking.path),
    external: false,
    isConfigured: true,
  };
}
