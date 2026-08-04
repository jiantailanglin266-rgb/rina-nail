import { describe, expect, it } from "vitest";

import { bookingMenus, bookingOptions, findMenu, visibleMenus } from "@/data/booking/menus";
import { bookingSettings, staffMembers } from "@/data/booking/settings";
import {
  buildSlots,
  dayKeyOf,
  formatDate,
  hasAnyAvailability,
  isBookableDate,
  toIso,
  totalBlockMinutes,
  totalPrice,
  treatmentMinutes,
} from "@/lib/booking/availability";
import {
  isValidEmail,
  isValidKana,
  isValidPhone,
  normalizePhone,
  validateBookingForm,
  type BookingForm,
} from "@/lib/booking/validate";

/** テストの基準時刻。2026-08-10 は月曜日（営業日） */
const MONDAY = "2026-08-10";
const WEDNESDAY = "2026-08-12";
const SATURDAY = "2026-08-15";
/** 前日の朝。当日締切の影響を受けない位置に置きます */
const NOW = new Date("2026-08-09T09:00:00+09:00");

describe("メニュー定義", () => {
  it("要件の13メニューをすべて持つ", () => {
    expect(bookingMenus).toHaveLength(13);
  });

  it("表示するメニューには必ず施術時間がある", () => {
    for (const menu of visibleMenus()) {
      expect(menu.durationMinutes).toBeGreaterThan(0);
      expect(menu.capacity).toBeGreaterThanOrEqual(1);
    }
  });

  it("要件の9オプションをすべて持つ", () => {
    expect(bookingOptions).toHaveLength(9);
  });

  it("料金が未確定のメニューは null で、架空の金額を持たない", () => {
    const undecided = bookingMenus.filter((menu) => menu.price === null);
    expect(undecided.map((menu) => menu.id)).toEqual(["broughtDesign", "sculpture", "consult"]);
  });
});

describe("所要時間と料金の計算", () => {
  it("準備・施術・片付けを合計する", () => {
    const menu = findMenu("oneColor")!;
    const expected =
      bookingSettings.bufferBeforeMinutes + menu.durationMinutes + bookingSettings.bufferAfterMinutes;
    expect(totalBlockMinutes("oneColor", [])).toBe(expected);
  });

  it("オプションの時間を加算する", () => {
    const base = totalBlockMinutes("oneColor", []);
    // 他店オフ（30分）＋ アート追加（15分）
    expect(totalBlockMinutes("oneColor", ["offOther", "art"])).toBe(base + 45);
  });

  it("お客様に見せる施術時間には準備・片付けを含めない", () => {
    expect(treatmentMinutes("oneColor", [])).toBe(60);
    expect(treatmentMinutes("oneColor", ["offOther"])).toBe(90);
  });

  it("オプションの料金を加算する", () => {
    // ワンカラー5500 + 他店オフ2200
    expect(totalPrice("oneColor", ["offOther"]).total).toBe(7700);
  });

  it("未確定の料金が含まれる場合はフラグで知らせる（合計を偽らない）", () => {
    const result = totalPrice("broughtDesign", ["art"]);
    expect(result.hasUndecided).toBe(true);
  });

  it("「〜」表記のオプションが含まれる場合は下限価格として扱う", () => {
    expect(totalPrice("oneColor", ["parts"]).isFrom).toBe(true);
  });
});

describe("予約できる日の判定", () => {
  it("定休日（土日）は受け付けない", () => {
    expect(isBookableDate(SATURDAY, NOW)).toBe(false);
  });

  it("水曜は短縮営業（10:00〜16:00）だが受け付ける", () => {
    expect(isBookableDate(WEDNESDAY, NOW)).toBe(true);
  });

  it("営業日は受け付ける", () => {
    expect(isBookableDate(MONDAY, NOW)).toBe(true);
  });

  it("過去の日付は受け付けない", () => {
    expect(isBookableDate("2026-08-03", NOW)).toBe(false);
  });

  it("受付期間（60日先）を超えた日は受け付けない", () => {
    const far = new Date(NOW.getTime());
    far.setDate(far.getDate() + bookingSettings.bookableDaysAhead + 1);
    expect(isBookableDate(formatDate(far), NOW)).toBe(false);
  });

  it("曜日の判定がタイムゾーンに左右されない", () => {
    expect(dayKeyOf(MONDAY)).toBe("mon");
    expect(dayKeyOf(WEDNESDAY)).toBe("wed");
    expect(dayKeyOf(SATURDAY)).toBe("sat");
  });
});

describe("空き枠の生成", () => {
  const base = { date: MONDAY, menuId: "oneColor", optionIds: [], busy: [], now: NOW };

  it("営業時間内で30分刻みの枠を作る", () => {
    const slots = buildSlots(base);
    expect(slots[0].time).toBe("10:00");
    expect(slots[1].time).toBe("10:30");
  });

  it("施術が営業終了をまたぐ枠は作らない", () => {
    const slots = buildSlots(base);
    const last = slots[slots.length - 1];
    // 月曜は18:00終了。ワンカラーは準備15+施術60+片付け15＝90分
    expect(last.time).toBe("16:30");
  });

  it("定休日は枠を作らない", () => {
    expect(buildSlots({ ...base, date: SATURDAY })).toHaveLength(0);
  });

  it("短縮営業日（水曜16:00終了）は枠が少なくなる", () => {
    const monday = buildSlots(base);
    const wednesday = buildSlots({ ...base, date: WEDNESDAY });
    expect(wednesday.length).toBeLessThan(monday.length);
    expect(wednesday[wednesday.length - 1].time).toBe("14:30");
  });

  it("スタッフの休憩時間は選べない", () => {
    const slots = buildSlots(base);
    const noon = slots.find((slot) => slot.time === "13:00");
    // 13:00〜14:00 が休憩
    expect(noon?.available).toBe(false);
  });

  it("Googleカレンダーの予定と重なる枠は選べない", () => {
    const busy = [{ start: toIso(MONDAY, "11:00"), end: toIso(MONDAY, "12:00") }];
    const slots = buildSlots({ ...base, busy });
    expect(slots.find((s) => s.time === "10:30")?.available).toBe(false); // 施術が11:00に食い込む
    // 12:00開始は準備が11:45から始まるため、11:00〜12:00の予定と重なります
    expect(slots.find((s) => s.time === "12:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "14:30")?.available).toBe(true);
  });

  it("予定の種類を問わず予約不可にする（外出・私用・休憩など）", () => {
    // カレンダー上の名前に関係なく、時間が重なれば埋まっている扱いにします
    const busy = [{ start: toIso(MONDAY, "10:00"), end: toIso(MONDAY, "18:00") }];
    expect(hasAnyAvailability(buildSlots({ ...base, busy }))).toBe(false);
  });

  it("準備・片付けの時間も占有として扱う", () => {
    // 12:00に予定がある場合、11:00開始（施術12:00終了＋片付け15分）は取れない
    const busy = [{ start: toIso(MONDAY, "12:10"), end: toIso(MONDAY, "12:20") }];
    const slots = buildSlots({ ...base, busy });
    // 11:00開始は施術12:00終了だが、片付け12:15までを占有するため取れません
    expect(slots.find((s) => s.time === "11:00")?.available).toBe(false);
    // 12:30開始は準備が12:15からで、12:20の予定と重なるため取れません
    expect(slots.find((s) => s.time === "12:30")?.available).toBe(false);
  });

  it("枠の時刻は施術開始時刻（準備開始ではない）", () => {
    const slots = buildSlots(base);
    // 10:00 の枠は 10:00 から施術。準備は開店前の 9:45 から行います
    expect(slots[0].time).toBe("10:00");
    // 終了は施術60分＋片付け15分後
    expect(slots[0].endIso).toBe(toIso(MONDAY, "11:15"));
  });

  it("当日の締切（3時間前）を過ぎた枠は選べない", () => {
    const now = new Date(`${MONDAY}T12:00:00+09:00`);
    const slots = buildSlots({ ...base, now });
    expect(slots.find((s) => s.time === "14:00")?.available).toBe(false);
    expect(slots.find((s) => s.time === "15:30")?.available).toBe(true);
  });

  it("オプションを足すと必要枠が伸び、遅い時間が取れなくなる", () => {
    const withoutOption = buildSlots(base);
    const withOption = buildSlots({ ...base, optionIds: ["offOther", "art"] });
    expect(withOption.length).toBeLessThan(withoutOption.length);
  });

  it("日をまたぐ予定でも当日の範囲だけを切り取る", () => {
    const busy = [
      { start: `2026-08-09T22:00:00+09:00`, end: toIso(MONDAY, "11:00") },
    ];
    const slots = buildSlots({ ...base, busy });
    expect(slots.find((s) => s.time === "10:00")?.available).toBe(false);
    // 11:00開始は準備が10:45からで、11:00までの予定と重なります
    expect(slots.find((s) => s.time === "11:30")?.available).toBe(true);
  });
});

describe("入力検証", () => {
  const valid: BookingForm = {
    name: "山田 花子",
    kana: "ヤマダ ハナコ",
    phone: "090-1234-5678",
    email: "hanako@example.com",
    agreeTerms: true,
    agreeCancel: true,
    agreePrivacy: true,
  };

  it("正しい入力ではエラーが出ない", () => {
    expect(validateBookingForm(valid)).toHaveLength(0);
  });

  it("必須項目が空ならエラーになる", () => {
    const errors = validateBookingForm({ ...valid, name: "", email: "" });
    expect(errors.map((e) => e.field)).toEqual(expect.arrayContaining(["name", "email"]));
  });

  it("同意していなければ予約できない", () => {
    const errors = validateBookingForm({ ...valid, agreeTerms: false, agreePrivacy: false });
    expect(errors.map((e) => e.field)).toEqual(
      expect.arrayContaining(["agreeTerms", "agreePrivacy"]),
    );
  });

  it("電話番号の形式を判定する", () => {
    expect(isValidPhone("09012345678")).toBe(true);
    expect(isValidPhone("090-1234-5678")).toBe(true);
    expect(isValidPhone("０９０１２３４５６７８")).toBe(true); // 全角
    expect(isValidPhone("0592-12-3456")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("abcdefghij")).toBe(false);
  });

  it("電話番号から記号を取り除く", () => {
    expect(normalizePhone("090-1234-5678")).toBe("09012345678");
    expect(normalizePhone("（090）1234 5678")).toBe("09012345678");
  });

  it("メールアドレスの形式を判定する", () => {
    expect(isValidEmail("a@b.co.jp")).toBe(true);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a b@c.com")).toBe(false);
    expect(isValidEmail("@c.com")).toBe(false);
  });

  it("フリガナはひらがな・カタカナのみ受け付ける", () => {
    expect(isValidKana("ヤマダ ハナコ")).toBe(true);
    expect(isValidKana("やまだ はなこ")).toBe(true);
    expect(isValidKana("山田 花子")).toBe(false);
    expect(isValidKana("Yamada")).toBe(false);
  });

  it("長すぎる自由記述を弾く", () => {
    const errors = validateBookingForm({ ...valid, note: "あ".repeat(501) });
    expect(errors.some((e) => e.field === "note")).toBe(true);
  });
});

describe("スタッフ設定", () => {
  it("1名のときは選択画面を出さない前提が満たされている", () => {
    expect(staffMembers.length).toBeGreaterThanOrEqual(1);
  });
});
