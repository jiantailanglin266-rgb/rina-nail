/**
 * 営業時間。曜日ラベルは翻訳ファイル（common.weekdays）側に持たせ、
 * ここでは構造だけを定義します。JSON-LD もこの配列から生成されます。
 */

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type BusinessDay = {
  day: DayKey;
  /** schema.org / OpeningHoursSpecification 用 */
  schemaDay: string;
  /** 24時間表記。定休日は null */
  opens: string | null;
  closes: string | null;
};

export const businessHours: BusinessDay[] = [
  { day: "mon", schemaDay: "Monday", opens: "10:00", closes: "18:00" },
  { day: "tue", schemaDay: "Tuesday", opens: "10:00", closes: "18:00" },
  { day: "wed", schemaDay: "Wednesday", opens: "10:00", closes: "16:00" },
  { day: "thu", schemaDay: "Thursday", opens: "10:00", closes: "18:00" },
  { day: "fri", schemaDay: "Friday", opens: "10:00", closes: "18:00" },
  { day: "sat", schemaDay: "Saturday", opens: null, closes: null },
  { day: "sun", schemaDay: "Sunday", opens: null, closes: null },
];

/** 営業日のみ（JSON-LD の openingHoursSpecification に使用） */
export const openDays = businessHours.filter(
  (d): d is BusinessDay & { opens: string; closes: string } =>
    d.opens !== null && d.closes !== null,
);
