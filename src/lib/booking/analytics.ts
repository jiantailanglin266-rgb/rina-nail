/**
 * 予約フローの計測（Google Analytics 4）。
 *
 * **個人情報は一切送りません。** 送るのはステップ名とメニューIDだけです。
 * 氏名・電話番号・メールアドレスをGAへ送ることは規約違反であり、
 * 事故になった場合の影響も大きいため、この関数を必ず経由してください。
 *
 * GA4 が未設置でも安全に動きます（`gtag` が無ければ何もしません）。
 */

type BookingEvent =
  | "booking_page_view"
  | "booking_step_view"
  | "booking_menu_select"
  | "booking_date_select"
  | "booking_form_complete"
  | "booking_complete"
  | "booking_abandon"
  | "booking_reschedule"
  | "booking_cancel";

/** 送信を許可するパラメータ。ここに無いキーは送りません */
type AllowedParams = {
  step?: string;
  menu?: string;
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
  if (params.step) safe.step = params.step;
  if (params.menu) safe.menu = params.menu;

  window.gtag("event", event, safe);
}
