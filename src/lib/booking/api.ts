import { bookingApiUrl } from "@/data/booking/settings";
import type { BusyPeriod } from "@/lib/booking/availability";
import type { BookingForm } from "@/lib/booking/validate";

/**
 * 予約APIのクライアント。
 *
 * ## なぜ Google Apps Script なのか
 *
 * このサイトは静的エクスポート（GitHub Pages）で配信しており、サーバーがありません。
 * Googleカレンダーの読み書きとメール送信には認証情報が必要ですが、
 * ブラウザ側のコードに置くと閲覧者全員に見えてしまいます。
 * そこで**サロンのGoogleアカウントで動く Apps Script** を唯一のサーバーとし、
 * 認証情報はそちら（スクリプトプロパティ）に置いています。
 *
 * ## CORS について
 *
 * Apps Script のウェブアプリはプリフライト（OPTIONS）に応答しません。
 * そのため POST では `Content-Type: text/plain` を使い、
 * プリフライトが発生しない「単純リクエスト」に収めています。
 * 本文はJSON文字列で、サーバー側で `JSON.parse` します。
 */

/** サーバーが返すエラーの種類。画面のメッセージはこのコードで切り替えます */
export type BookingErrorCode =
  | "slotTaken" // 確定直前に埋まった
  | "outsideHours" // 営業時間外
  | "pastDate" // 過去日時
  | "tooSoon" // 締切を過ぎている
  | "dailyLimit" // 1日の上限
  | "invalidInput" // 入力不備
  | "invalidToken" // 変更・キャンセルのリンクが不正
  | "expiredToken" // 期限切れ
  | "alreadyCancelled"
  | "rateLimited"
  | "calendarError"
  | "network"
  | "unknown";

export class BookingError extends Error {
  constructor(
    readonly code: BookingErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "BookingError";
  }
}

export type AvailabilityResponse = {
  /** 予約不可の時間帯（Googleカレンダーの予定から作られます） */
  busy: BusyPeriod[];
  /** その日にすでに入っている予約件数（1日の上限判定に使います） */
  reservationCount: number;
};

export type CreateBookingInput = {
  menuId: string;
  optionIds: string[];
  staffId?: string;
  startIso: string;
  form: BookingForm;
  locale: string;
  /**
   * 二重送信を防ぐための鍵。
   * 同じ鍵で2回届いた場合、サーバーは2件目を新規登録せず、
   * 1件目の結果をそのまま返します（冪等性）。
   */
  idempotencyKey: string;
};

export type CreateBookingResult = {
  reservationId: string;
  /** 予約変更・キャンセル用の署名付きトークン */
  manageToken: string;
  startIso: string;
  endIso: string;
  /** すでに同じ鍵で登録済みだった場合 true（二重送信時） */
  duplicated: boolean;
};

export type ReservationSummary = {
  reservationId: string;
  status: "confirmed" | "cancelled";
  startIso: string;
  endIso: string;
  menuId: string;
  optionIds: string[];
  name: string;
};

const TIMEOUT_MS = 15000;

async function request<T>(payload: Record<string, unknown>): Promise<T> {
  if (!bookingApiUrl) throw new BookingError("unknown", "予約APIが設定されていません");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(bookingApiUrl, {
      method: "POST",
      // プリフライトを避けるため text/plain のまま送ります（本文はJSON）
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      redirect: "follow",
    });
  } catch {
    throw new BookingError("network");
  } finally {
    clearTimeout(timer);
  }

  let data: { ok?: boolean; code?: BookingErrorCode; data?: T };
  try {
    data = await response.json();
  } catch {
    throw new BookingError("unknown");
  }

  if (!data.ok) throw new BookingError(data.code ?? "unknown");
  return data.data as T;
}

/** 指定日の予約不可時間を取得します */
export function fetchAvailability(params: {
  date: string;
  staffId?: string;
}): Promise<AvailabilityResponse> {
  return request<AvailabilityResponse>({ action: "availability", ...params });
}

/** 予約を確定します。サーバー側で空き状況を再確認してから登録されます */
export function createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
  return request<CreateBookingResult>({ action: "create", ...input });
}

/** 変更・キャンセル画面で、トークンから予約内容を取得します */
export function fetchReservation(token: string): Promise<ReservationSummary> {
  return request<ReservationSummary>({ action: "get", token });
}

/** 予約日時を変更します */
export function rescheduleBooking(params: {
  token: string;
  startIso: string;
  idempotencyKey: string;
}): Promise<CreateBookingResult> {
  return request<CreateBookingResult>({ action: "reschedule", ...params });
}

/** 予約をキャンセルします */
export function cancelBooking(params: {
  token: string;
  idempotencyKey: string;
}): Promise<{ reservationId: string }> {
  return request<{ reservationId: string }>({ action: "cancel", ...params });
}

/**
 * 二重送信防止用の鍵を作ります。
 * `crypto.randomUUID` が使えない環境（古いSafari等）でも動くようにしています。
 */
export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `k-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}
