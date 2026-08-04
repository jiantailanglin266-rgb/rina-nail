/**
 * ネット予約（Googleカレンダーの予約スケジュール）の設定。
 *
 * ## 役割の分け方
 *
 * - **環境変数**: Googleが発行する予約ページURL（環境ごとに変わるもの）
 * - **このファイル**: 表示の構成・出す注意事項の種類・iframeの高さ（コードの設定）
 * - **翻訳ファイル**: 実際に表示する文章（`booking.*`。5言語ぶん）
 *
 * 文章をこのファイルに書かないのは、多言語で同じ内容を二重管理しないためです。
 */

import { links, placeholders, resolved } from "@/data/site";

/**
 * Googleカレンダーの予約ページURL。
 *
 * **Googleの通常のカレンダーURLではありません。**
 * 「予約スケジュール」を作成すると発行される専用のURLです。
 * 取得方法は `docs/GOOGLE-APPOINTMENT-SETUP.md` を参照してください。
 */
export const googleBookingUrl = process.env.NEXT_PUBLIC_GOOGLE_BOOKING_URL ?? "";

/**
 * 予約ページとして受け付けるホスト。
 *
 * Googleは長いURL（`calendar.google.com/calendar/appointments/schedules/...`）と、
 * 短縮リンク（`calendar.app.google/...`）の両方を発行します。
 * どちらも正規のURLなので、両方を許可します
 * （厳しくしすぎて正規URLを弾かないようにするためです）。
 */
const ALLOWED_HOSTS = ["calendar.google.com", "calendar.app.google"];

export type UrlCheck =
  | { valid: true; url: URL }
  | { valid: false; reason: "empty" | "scheme" | "host" | "malformed" };

/**
 * 予約URLが妥当かを確認します。
 *
 * `javascript:` のような危険なスキームや、Google以外のドメインを弾きます。
 * 設定ミスに気づけるよう、理由も返します（本番画面には出しません）。
 */
export function checkBookingUrl(value: string): UrlCheck {
  const trimmed = value.trim();
  if (!trimmed) return { valid: false, reason: "empty" };

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { valid: false, reason: "malformed" };
  }

  // http: や javascript: を除外します
  if (url.protocol !== "https:") return { valid: false, reason: "scheme" };
  if (!ALLOWED_HOSTS.includes(url.hostname)) return { valid: false, reason: "host" };

  return { valid: true, url };
}

/** 予約画面を表示できる状態か */
export function isBookingConfigured(): boolean {
  return checkBookingUrl(googleBookingUrl).valid;
}

/**
 * iframe に読み込むURLを作ります。
 *
 * Googleの埋め込みコードは長いURLに `gv=true` を付けた形です。
 * 短縮リンクの場合はそのまま使います（リダイレクト先で同じ画面になります）。
 * 未設定・不正な場合は **null を返し、iframeを描画しません**
 * （空のiframeやダミーURLを出さないため）。
 */
export function bookingEmbedUrl(): string | null {
  const check = checkBookingUrl(googleBookingUrl);
  if (!check.valid) return null;

  const url = check.url;
  if (url.pathname.includes("/appointments/schedules/")) {
    url.searchParams.set("gv", "true");
  }
  return url.toString();
}

/** 別タブで開く用のURL（埋め込み用パラメータを付けません） */
export function bookingPageUrl(): string | null {
  const check = checkBookingUrl(googleBookingUrl);
  return check.valid ? check.url.toString() : null;
}

/**
 * 予約画面が出せないときの連絡先。
 *
 * 電話番号は未設定のことがあるため、**設定済みのときだけ**電話導線を出します
 * （`tel:` が空のリンクを作らないようにするため）。
 * このサイトには問い合わせフォームが無いので、店舗情報ページへ案内します。
 */
export function fallbackContact(): { phone: string | undefined; telHref: string | undefined } {
  const phone = resolved(placeholders.phoneNumber);
  return {
    phone,
    telHref: phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : undefined,
  };
}

/** 外部の予約サイトURL（ホットペッパー等）が別途設定されているか */
export function hasExternalBookingSite(): boolean {
  return Boolean(resolved(links.booking));
}

/**
 * 予約ページに出す注意事項の並び順。
 *
 * 文章は翻訳ファイルの `booking.notices.<key>` にあります。
 * 表示したくない項目はここから外してください（文章を消す必要はありません）。
 */
export const bookingNoticeKeys = [
  "selectFromCalendar",
  "confirmationMail",
  "durationVaries",
  "checkSpam",
  "sameDayChange",
] as const;

/**
 * 来店・キャンセルに関するポリシーの並び順。
 * 文章は `booking.policies.<key>` にあります。
 */
export const bookingPolicyKeys = [
  "lateArrival",
  "sameDayCancel",
  "noShow",
  "offNeeded",
  "broughtDesign",
  "allergy",
  "payment",
  "children",
  "parking",
] as const;

/**
 * iframe の高さ。
 *
 * Google側の画面は、日付選択→時間選択→入力フォームと進むにつれて縦に伸びます。
 * 低いと画面内で二重スクロールになり、スマートフォンで非常に操作しづらくなるため、
 * **スマートフォンでいちばん高く**取ります。
 * `clamp` で画面の高さにも追従させ、極端に大きくならないようにしています。
 */
export const bookingFrameHeight = {
  mobile: "clamp(900px, 130vh, 1200px)",
  desktop: "clamp(800px, 95vh, 1000px)",
} as const;
