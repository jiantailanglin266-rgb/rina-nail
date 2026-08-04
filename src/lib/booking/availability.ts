import type { DayKey } from "@/data/hours";
import { findMenu, findOption } from "@/data/booking/menus";
import { bookingSettings, openingHoursFor, staffMembers } from "@/data/booking/settings";

/**
 * 空き時間の計算。
 *
 * **この計算はブラウザ側とサーバー側（Google Apps Script）の両方で行います。**
 * ブラウザ側は「選べる枠を見せる」ため、サーバー側は「本当に取れるか確かめる」ためです。
 * 画面を開いてから確定するまでのあいだに他の方が予約する可能性があるので、
 * 最終判断は必ずサーバー側で行います（ここだけでは重複を防げません）。
 *
 * ここは副作用のない純粋な関数にしてあり、テストで検証しています。
 */

/** 予約できない時間帯（Googleカレンダーの予定から作ります） */
export type BusyPeriod = {
  /** ISO 8601（例: 2026-08-10T10:00:00+09:00） */
  start: string;
  end: string;
};

export type TimeSlot = {
  /** "HH:MM" */
  time: string;
  /** 施術開始のISO日時 */
  startIso: string;
  /** 準備・片付けを含めた占有終了のISO日時 */
  endIso: string;
  available: boolean;
};

const DAY_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/** "HH:MM" を、その日の0時からの経過分に変換します */
export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function toTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * 施術に必要な合計時間（準備＋施術＋オプション＋片付け）を分で返します。
 * カレンダーを占有する長さであり、お客様に見せる「所要時間」とは別です。
 */
export function totalBlockMinutes(menuId: string, optionIds: string[]): number {
  const menu = findMenu(menuId);
  if (!menu) return 0;

  const optionMinutes = optionIds.reduce((total, id) => {
    return total + (findOption(id)?.durationMinutes ?? 0);
  }, 0);

  const prep = menu.prepMinutes ?? bookingSettings.bufferBeforeMinutes;
  const cleanup = menu.cleanupMinutes ?? bookingSettings.bufferAfterMinutes;

  return prep + menu.durationMinutes + optionMinutes + cleanup;
}

/** お客様に見せる施術時間（準備・片付けを含みません） */
export function treatmentMinutes(menuId: string, optionIds: string[]): number {
  const menu = findMenu(menuId);
  if (!menu) return 0;
  return (
    menu.durationMinutes +
    optionIds.reduce((total, id) => total + (findOption(id)?.durationMinutes ?? 0), 0)
  );
}

/** 合計金額。未確定の項目が含まれる場合は `hasUndecided` が true になります */
export function totalPrice(
  menuId: string,
  optionIds: string[],
): { total: number; hasUndecided: boolean; isFrom: boolean } {
  const menu = findMenu(menuId);
  if (!menu) return { total: 0, hasUndecided: true, isFrom: false };

  let total = menu.price ?? 0;
  let hasUndecided = menu.price === null;
  let isFrom = Boolean(menu.from);

  for (const id of optionIds) {
    const option = findOption(id);
    if (!option) continue;
    if (option.price === null) hasUndecided = true;
    else total += option.price;
    if (option.from) isFrom = true;
  }

  return { total, hasUndecided, isFrom };
}

/** 日付文字列（YYYY-MM-DD）から曜日キーを取り出します */
export function dayKeyOf(date: string, timeZone = bookingSettings.timeZone): DayKey {
  // タイムゾーンを固定して曜日を求めます（実行環境のTZに影響されないため）
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" });
  const label = formatter.format(new Date(`${date}T12:00:00${tzOffsetSuffix()}`));
  const map: Record<string, DayKey> = {
    Sun: "sun", Mon: "mon", Tue: "tue", Wed: "wed", Thu: "thu", Fri: "fri", Sat: "sat",
  };
  return map[label] ?? DAY_KEYS[0];
}

/** Asia/Tokyo の固定オフセット。GAS 側と表記を合わせます */
export function tzOffsetSuffix(): string {
  return "+09:00";
}

/** `YYYY-MM-DD` + `HH:MM` を ISO 文字列にします */
export function toIso(date: string, time: string): string {
  return `${date}T${time}:00${tzOffsetSuffix()}`;
}

/** 臨時休業日かどうか */
export function isTemporarilyClosed(date: string): boolean {
  return bookingSettings.temporaryClosures.includes(date);
}

/**
 * 予約を受け付けられる日付かどうか（枠の有無は見ません）。
 * 「定休日」「臨時休業」「受付期間外」「過去」を判定します。
 */
export function isBookableDate(date: string, now: Date): boolean {
  if (isTemporarilyClosed(date)) return false;
  if (!openingHoursFor(dayKeyOf(date))) return false;

  const today = formatDate(now);
  if (date < today) return false;

  const limit = new Date(now.getTime());
  limit.setDate(limit.getDate() + bookingSettings.bookableDaysAhead);
  return date <= formatDate(limit);
}

/** Date を Asia/Tokyo の YYYY-MM-DD にします */
export function formatDate(date: Date, timeZone = bookingSettings.timeZone): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return parts;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * 指定日の予約枠を作り、埋まっている枠を落とします。
 *
 * 予約不可にするのは次のすべてです（要件どおり）。
 * - すでに入っている予約・施術予定
 * - Googleカレンダーの予定（休憩・外出・私用・臨時休業など、種類を問いません）
 * - 営業時間外・定休日
 * - スタッフの休憩時間
 * - 準備時間・片付け時間（施術の前後に確保します）
 * - 当日の締切を過ぎた時間
 */
export function buildSlots({
  date,
  menuId,
  optionIds,
  busy,
  now,
  staffId,
}: {
  date: string;
  menuId: string;
  optionIds: string[];
  busy: BusyPeriod[];
  now: Date;
  staffId?: string;
}): TimeSlot[] {
  const hours = openingHoursFor(dayKeyOf(date));
  if (!hours || isTemporarilyClosed(date)) return [];

  const menu = findMenu(menuId);
  if (!menu) return [];

  /*
   * 枠に表示する時刻は「お客様の施術開始時刻」です。
   *
   * カレンダーを占有するのはその前後を含めた範囲で、
   *   [施術開始 − 準備時間, 施術開始 + 施術時間 + 片付け時間]
   * になります。準備時間が開店前にはみ出すのは想定どおりです
   * （開店前に準備するため）。片付けは閉店時刻までに収める必要があります。
   *
   * 枠の時刻を「準備開始」にすると、10:00 と表示された枠の施術が
   * 実際には 10:15 開始になり、お客様の認識とずれます。
   */
  const prep = menu.prepMinutes ?? bookingSettings.bufferBeforeMinutes;
  const cleanup = menu.cleanupMinutes ?? bookingSettings.bufferAfterMinutes;
  const treatment = treatmentMinutes(menuId, optionIds);
  if (treatment === 0) return [];

  const openMinutes = toMinutes(hours.opens);
  const closeMinutes = toMinutes(hours.closes);
  const step = bookingSettings.slotIntervalMinutes;

  // Googleカレンダーの予定を、その日の「分」の区間に変換します
  const busyRanges = busy
    .map((period) => ({
      start: minutesFromIso(period.start, date),
      end: minutesFromIso(period.end, date),
    }))
    .filter((range) => range.start !== null && range.end !== null) as {
    start: number;
    end: number;
  }[];

  // スタッフの休憩を予約不可の区間として加えます
  const staff = staffMembers.find((member) => member.id === staffId) ?? staffMembers[0];
  for (const rest of staff?.breaks ?? []) {
    busyRanges.push({ start: toMinutes(rest.start), end: toMinutes(rest.end) });
  }

  // 当日の締切（○時間前まで）
  const earliestStart = new Date(now.getTime() + bookingSettings.minLeadTimeHours * 3600_000);

  const slots: TimeSlot[] = [];
  for (let start = openMinutes; start + treatment + cleanup <= closeMinutes; start += step) {
    // カレンダーを占有する範囲（準備〜片付け）
    const blockStart = start - prep;
    const blockEnd = start + treatment + cleanup;
    const startIso = toIso(date, toTimeString(start));

    const isPast = new Date(startIso).getTime() < earliestStart.getTime();
    const isBusy = busyRanges.some((range) =>
      overlaps(blockStart, blockEnd, range.start, range.end),
    );

    slots.push({
      time: toTimeString(start),
      startIso,
      endIso: toIso(date, toTimeString(blockEnd)),
      available: !isPast && !isBusy,
    });
  }

  return slots;
}

/**
 * ISO日時を、指定日の0時からの経過分にします。
 * 対象日をまたぐ予定（前日22時〜当日2時など）も正しく切り取ります。
 */
function minutesFromIso(iso: string, date: string): number | null {
  const target = new Date(`${date}T00:00:00${tzOffsetSuffix()}`).getTime();
  const value = new Date(iso).getTime();
  if (Number.isNaN(value)) return null;

  const diffMinutes = Math.round((value - target) / 60000);
  // 当日より前は0、翌日以降は24時間として扱います
  if (diffMinutes < 0) return 0;
  if (diffMinutes > 24 * 60) return 24 * 60;
  return diffMinutes;
}

/** 1件でも空きがあるか */
export function hasAnyAvailability(slots: TimeSlot[]): boolean {
  return slots.some((slot) => slot.available);
}
