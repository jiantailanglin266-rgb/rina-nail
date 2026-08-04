/**
 * 予約メニューとオプション。
 *
 * 表示名・説明は翻訳ファイル（`booking.menus.<id>` / `booking.options.<id>`）に置き、
 * ここには **料金と時間だけ** を持たせます（多言語で数値がずれないようにするため）。
 *
 * 料金が未確定のメニューは `price: null` にしてください。
 * 架空の金額は入れません（`docs/PLACEHOLDERS.md`）。
 */

export type BookingMenu = {
  id: string;
  /** 税込価格。未確定なら null */
  price: number | null;
  /** 「〜」表記にするか（下限価格） */
  from?: boolean;
  /** 施術時間（分） */
  durationMinutes: number;
  /** このメニュー固有の準備時間（分）。未指定なら共通設定を使います */
  prepMinutes?: number;
  /** このメニュー固有の片付け時間（分） */
  cleanupMinutes?: number;
  /** 同時に受けられる人数。プライベートサロンのため基本は1 */
  capacity: number;
  /** 予約画面に表示するか */
  visible: boolean;
  /** オフの有無を尋ねるか */
  asksOff: boolean;
  /** オプションを選べるか */
  allowsOptions: boolean;
};

export const bookingMenus: BookingMenu[] = [
  { id: "oneColor", price: 5500, durationMinutes: 60, capacity: 1, visible: true, asksOff: true, allowsOptions: true },
  { id: "gradation", price: 6600, durationMinutes: 75, capacity: 1, visible: true, asksOff: true, allowsOptions: true },
  { id: "french", price: 6600, durationMinutes: 75, capacity: 1, visible: true, asksOff: true, allowsOptions: true },
  { id: "flatSimple", price: 7700, durationMinutes: 90, capacity: 1, visible: true, asksOff: true, allowsOptions: true },
  { id: "flatDesign", price: 8800, durationMinutes: 105, capacity: 1, visible: true, asksOff: true, allowsOptions: true },
  // 料金未確定のメニューは価格を出さず、来店時にご案内します
  { id: "broughtDesign", price: null, from: true, durationMinutes: 120, capacity: 1, visible: true, asksOff: true, allowsOptions: true },
  { id: "gelOff", price: 2200, durationMinutes: 30, capacity: 1, visible: true, asksOff: false, allowsOptions: false },
  { id: "sculpture", price: null, from: true, durationMinutes: 120, capacity: 1, visible: true, asksOff: true, allowsOptions: true },
  { id: "nailCare", price: 4400, durationMinutes: 45, capacity: 1, visible: true, asksOff: false, allowsOptions: false },
  { id: "footNail", price: 7700, durationMinutes: 90, capacity: 1, visible: true, asksOff: true, allowsOptions: true },
  { id: "extension", price: 550, from: true, durationMinutes: 20, capacity: 1, visible: true, asksOff: false, allowsOptions: false },
  { id: "repair", price: 550, from: true, durationMinutes: 15, capacity: 1, visible: true, asksOff: false, allowsOptions: false },
  { id: "consult", price: null, durationMinutes: 30, capacity: 1, visible: true, asksOff: false, allowsOptions: false },
];

export type BookingOption = {
  id: string;
  /** 加算する料金（税込）。未確定なら null */
  price: number | null;
  from?: boolean;
  /** 加算する施術時間（分） */
  durationMinutes: number;
  visible: boolean;
};

export const bookingOptions: BookingOption[] = [
  { id: "offOther", price: 2200, durationMinutes: 30, visible: true },
  { id: "offOwn", price: 1100, durationMinutes: 20, visible: true },
  { id: "extension", price: 550, from: true, durationMinutes: 20, visible: true },
  { id: "repair", price: 550, from: true, durationMinutes: 15, visible: true },
  { id: "parts", price: 110, from: true, durationMinutes: 10, visible: true },
  { id: "art", price: 550, from: true, durationMinutes: 15, visible: true },
  { id: "footChange", price: 2200, durationMinutes: 30, visible: true },
  { id: "colorAdd", price: 550, from: true, durationMinutes: 10, visible: true },
  { id: "stone", price: 110, from: true, durationMinutes: 10, visible: true },
];

export function findMenu(id: string): BookingMenu | undefined {
  return bookingMenus.find((menu) => menu.id === id);
}

export function findOption(id: string): BookingOption | undefined {
  return bookingOptions.find((option) => option.id === id);
}

/** 予約画面に出すメニューだけを返します */
export function visibleMenus(): BookingMenu[] {
  return bookingMenus.filter((menu) => menu.visible);
}

export function visibleOptions(): BookingOption[] {
  return bookingOptions.filter((option) => option.visible);
}
