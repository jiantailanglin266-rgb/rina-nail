import { isBookingEnabled } from "@/data/booking/settings";
import { localeHref, routes } from "@/data/navigation";
import { isPlaceholder, links } from "@/data/site";
import type { Locale } from "@/i18n/config";

export type BookingLink = {
  href: string;
  /** 外部の予約サイトを開くか（未設定時はサイト内リンクになるため false） */
  external: boolean;
  /** 予約URLが設定済みか。CTAの文言を切り替えたい場合に使います */
  isConfigured: boolean;
};

/**
 * 予約CTAのリンク先を1か所で決めます。
 *
 * 予約URLが未設定（`{{BOOKING_URL}}` のまま）だと、`href` にその文字列がそのまま入り、
 * サイト内の予約CTA すべてが「押しても存在しないURLへ飛ぶ行き止まり」になります。
 * 予約CTAは全ページ合わせて数十か所あるため、影響が大きい状態です。
 *
 * そのため未設定のあいだは、**アクセスページ**（住所・営業時間・地図・ご予約の案内が
 * まとまっているページ）へ誘導します。予約サイトへは行けませんが、
 * 来店に必要な情報にはたどり着けます。
 *
 * 予約URLを設定すれば、この関数を経由しているCTAはすべて自動で予約サイトへ切り替わります。
 * 新しく予約CTAを追加するときも、必ずこの関数を使ってください。
 */
export function bookingLink(locale: Locale): BookingLink {
  // 外部の予約サイトURLが設定されていれば、そちらを優先します
  if (!isPlaceholder(links.booking)) {
    return { href: links.booking, external: true, isConfigured: true };
  }

  // 既定はサイト内のネット予約ページです（サイト内で予約が完結します）
  if (isBookingEnabled()) {
    return { href: localeHref(locale, routes.booking.path), external: false, isConfigured: true };
  }

  /*
   * 予約APIも外部URLも未設定の場合だけ、アクセスページへ逃がします。
   * 押しても何も起きないボタンを残さないための最後の受け皿です。
   */
  return { href: localeHref(locale, routes.access.path), external: false, isConfigured: false };
}
