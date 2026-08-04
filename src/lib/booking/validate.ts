/**
 * 予約フォームの入力検証。
 *
 * **同じ検証をサーバー側（Google Apps Script）でも行います。**
 * ブラウザ側の検証は「その場で気づけるようにする」ためのもので、
 * 開発者ツールから直接APIを叩けば回避できます。信頼できるのはサーバー側だけです。
 */

export type BookingForm = {
  // 必須
  name: string;
  kana: string;
  phone: string;
  email: string;
  // 任意
  staffId?: string;
  needsOff?: "none" | "own" | "other";
  nailCondition?: string;
  allergy?: string;
  color?: string;
  design?: string;
  note?: string;
  visitType?: "first" | "repeat";
  contactPreference?: "email" | "phone";
  // 同意
  agreeTerms: boolean;
  agreeCancel: boolean;
  agreePrivacy: boolean;
};

export type FieldError = { field: keyof BookingForm; code: string };

/** 全角・半角の記号を取り除いた電話番号 */
export function normalizePhone(value: string): string {
  return value
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[^0-9+]/g, "");
}

/**
 * 日本の電話番号として妥当か。
 * 市外局番の桁は地域で変わるため、桁数の範囲だけを見ます
 * （厳しくしすぎると正しい番号を弾いてしまうため）。
 */
export function isValidPhone(value: string): boolean {
  const normalized = normalizePhone(value);
  if (normalized.startsWith("+")) return /^\+\d{10,15}$/.test(normalized);
  return /^0\d{9,10}$/.test(normalized);
}

/**
 * メールアドレスの形式。
 * RFCを完全に再現するのは現実的でないため、
 * 「@がひとつ」「前後に文字がある」「ドメインにドットがある」を確認します。
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value.trim());
}

/** ふりがな（ひらがな・カタカナ・空白のみ） */
export function isValidKana(value: string): boolean {
  return /^[ぁ-ゖァ-ヺー\s　]+$/.test(value.trim());
}

/** 自由記述の上限。長すぎる入力はカレンダーやメールを壊すため制限します */
export const MAX_TEXT_LENGTH = 500;
export const MAX_NAME_LENGTH = 60;

export function validateBookingForm(form: BookingForm): FieldError[] {
  const errors: FieldError[] = [];
  const add = (field: keyof BookingForm, code: string) => errors.push({ field, code });

  if (!form.name.trim()) add("name", "required");
  else if (form.name.trim().length > MAX_NAME_LENGTH) add("name", "tooLong");

  if (!form.kana.trim()) add("kana", "required");
  else if (form.kana.trim().length > MAX_NAME_LENGTH) add("kana", "tooLong");
  else if (!isValidKana(form.kana)) add("kana", "kana");

  if (!form.phone.trim()) add("phone", "required");
  else if (!isValidPhone(form.phone)) add("phone", "phone");

  if (!form.email.trim()) add("email", "required");
  else if (!isValidEmail(form.email)) add("email", "email");

  for (const field of ["nailCondition", "allergy", "color", "design", "note"] as const) {
    const value = form[field];
    if (value && value.length > MAX_TEXT_LENGTH) add(field, "tooLong");
  }

  if (!form.agreeTerms) add("agreeTerms", "required");
  if (!form.agreeCancel) add("agreeCancel", "required");
  if (!form.agreePrivacy) add("agreePrivacy", "required");

  return errors;
}

export function hasError(errors: FieldError[], field: keyof BookingForm): boolean {
  return errors.some((error) => error.field === field);
}

export function errorCodeOf(errors: FieldError[], field: keyof BookingForm): string | undefined {
  return errors.find((error) => error.field === field)?.code;
}
