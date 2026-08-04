/**
 * 予約の運用設定。
 *
 * ここが唯一の情報源です。営業時間・受付ルールを変えるときは
 * **このファイルと Google Apps Script 側の設定（同じ値）** を更新してください。
 * サーバー側（GAS）でも同じ検証を行うため、値がずれると
 * 「画面では選べるのに確定できない」状態になります。
 */

import { businessHours, type DayKey } from "@/data/hours";

export type StaffMember = {
  id: string;
  /** 表示名。翻訳しません（個人名のため） */
  name: string;
  /** 勤務する曜日。空なら営業日に準じます */
  workingDays?: DayKey[];
  /** 休憩時間（毎日同じ場合） */
  breaks?: { start: string; end: string }[];
};

/**
 * スタッフ。1名のときは選択画面を出しません（要件どおり）。
 * 増えた場合はここに追加すれば、自動的に選択画面が表示されます。
 */
export const staffMembers: StaffMember[] = [
  {
    id: "rina",
    name: "中村 梨奈",
    breaks: [{ start: "13:00", end: "14:00" }],
  },
];

export const bookingSettings = {
  /** 予約枠の刻み（分） */
  slotIntervalMinutes: 30,
  /** 施術前の準備時間（分）。カレンダー予定にも含めます */
  bufferBeforeMinutes: 15,
  /** 施術後の片付け時間（分） */
  bufferAfterMinutes: 15,
  /** 何日先まで予約を受け付けるか */
  bookableDaysAhead: 60,
  /** 当日予約の締切（時間）。3なら「3時間前まで」 */
  minLeadTimeHours: 3,
  /** 1日に受ける最大件数 */
  maxReservationsPerDay: 4,
  /** 臨時休業日（YYYY-MM-DD）。Googleカレンダーに「休み」と入れても反映されます */
  temporaryClosures: [] as string[],
  /** タイムゾーン。GAS側と必ず一致させます */
  timeZone: "Asia/Tokyo",
  /** リマインドの送信タイミング（GAS のトリガーが参照します） */
  reminders: {
    /** 前日の何時に送るか（24時間表記） */
    previousDayAtHour: 10,
    /** 予約の何時間前に送るか。0 なら送りません */
    hoursBefore: 3,
  },
} as const;

/** 曜日ごとの営業時間（`src/data/hours.ts` と同じ情報源） */
export function openingHoursFor(day: DayKey): { opens: string; closes: string } | null {
  const found = businessHours.find((entry) => entry.day === day);
  if (!found || found.opens === null || found.closes === null) return null;
  return { opens: found.opens, closes: found.closes };
}

/** 予約APIのエンドポイント（Google Apps Script のウェブアプリURL） */
export const bookingApiUrl = process.env.NEXT_PUBLIC_BOOKING_API_URL ?? "";

/** 予約機能が使える状態か（未設定ならフォームを出さず、案内に切り替えます） */
export function isBookingEnabled(): boolean {
  return bookingApiUrl.startsWith("https://");
}
