/**
 * 予約導線の計測（Google Analytics 4）。
 *
 * **個人情報は一切送りません。** 氏名・電話番号・メールアドレス・予約内容は
 * すべてGoogle側の画面で入力されるため、そもそもサイト側に渡ってきません。
 * この関数が送るのは、どのボタンが押されたかだけです。
 *
 * また、**予約が完了したかどうかは計測しません。**
 * 予約はGoogleの画面（別ドメインのiframe）の中で完了するため、
 * サイト側から確認する手段がありません。
 * 推測で「予約完了」を送ると、実際の予約数と食い違う数字が残ります。
 *
 * GA4が未設置でも安全に動きます（`gtag` が無ければ何もしません）。
 */

export type BookingEvent =
  /** 予約ページの表示 */
  | "view_booking_page"
  /** サイト内の予約ボタンのクリック */
  | "click_booking_button"
  /** Google予約ページを別タブで開いた */
  | "open_google_booking"
  /** 埋め込みが見られないときのフォールバックリンク */
  | "click_booking_fallback";

/** 送信を許可するパラメータ。ここに無いキーは送りません */
type AllowedParams = {
  /** どこのボタンか（header / hero / footer など） */
  location?: string;
};

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

export function trackBookingEvent(event: BookingEvent, params: AllowedParams = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  // 明示的に許可したキーだけを取り出します（うっかり個人情報を渡さないため）
  const safe: Record<string, string> = {};
  if (params.location) safe.location = params.location;

  window.gtag("event", event, safe);
}
