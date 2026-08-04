import { describe, expect, it, vi } from "vitest";

import { checkBookingUrl } from "@/data/booking/config";
import { allRoutes, mainNavKeys, routes } from "@/data/navigation";
import ja from "@/i18n/messages/ja.json";
import en from "@/i18n/messages/en.json";
import ko from "@/i18n/messages/ko.json";
import zhCn from "@/i18n/messages/zh-cn.json";
import zhTw from "@/i18n/messages/zh-tw.json";
import { bookingLink } from "@/lib/booking";

/**
 * Google予約ページURLの検証。
 *
 * 危険なURLをiframeに入れないための最後の砦なので、
 * 「弾くべきものを弾く」と「正規URLを弾かない」の両方を確認します。
 */
describe("予約URLの検証", () => {
  it("Googleの予約ページURL（長い形式）を受け入れる", () => {
    const url =
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0abcDEF123456789";
    expect(checkBookingUrl(url).valid).toBe(true);
  });

  it("Googleの短縮リンク（calendar.app.google）も受け入れる", () => {
    // 厳しくしすぎて正規URLを弾かないことの確認
    expect(checkBookingUrl("https://calendar.app.google/abcd1234").valid).toBe(true);
  });

  it("前後の空白があっても受け入れる", () => {
    expect(checkBookingUrl("  https://calendar.app.google/abcd  ").valid).toBe(true);
  });

  it("未設定は empty として扱う", () => {
    expect(checkBookingUrl("")).toEqual({ valid: false, reason: "empty" });
    expect(checkBookingUrl("   ")).toEqual({ valid: false, reason: "empty" });
  });

  it("javascript: などの危険なスキームを拒否する", () => {
    for (const dangerous of [
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "vbscript:msgbox(1)",
      "file:///etc/passwd",
    ]) {
      expect(checkBookingUrl(dangerous).valid).toBe(false);
    }
  });

  it("http（暗号化なし）を拒否する", () => {
    expect(checkBookingUrl("http://calendar.google.com/calendar/appointments/schedules/x")).toEqual({
      valid: false,
      reason: "scheme",
    });
  });

  it("Google以外のドメインを拒否する", () => {
    for (const host of [
      "https://example.com/calendar/appointments/schedules/x",
      "https://calendar.google.com.evil.test/x",
      "https://evil.test/?calendar.google.com",
    ]) {
      expect(checkBookingUrl(host)).toEqual({ valid: false, reason: "host" });
    }
  });

  it("URLとして壊れている文字列を拒否する", () => {
    expect(checkBookingUrl("これはURLではありません")).toEqual({
      valid: false,
      reason: "malformed",
    });
  });
});

/**
 * 埋め込みURLの組み立て。
 * 環境変数はモジュール読み込み時に評価されるため、動的インポートで確認します。
 */
describe("埋め込みURLの組み立て", () => {
  async function withUrl(value: string) {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_BOOKING_URL", value);
    return import("@/data/booking/config");
  }

  it("長いURLには埋め込み用の gv=true を付ける", async () => {
    const mod = await withUrl(
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0abc",
    );
    expect(mod.bookingEmbedUrl()).toContain("gv=true");
  });

  it("別タブ用のURLには gv=true を付けない", async () => {
    const mod = await withUrl(
      "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0abc",
    );
    expect(mod.bookingPageUrl()).not.toContain("gv=true");
  });

  it("短縮リンクはそのまま使う", async () => {
    const mod = await withUrl("https://calendar.app.google/abcd1234");
    expect(mod.bookingEmbedUrl()).not.toContain("gv=true");
    expect(mod.isBookingConfigured()).toBe(true);
  });

  it("未設定なら null を返し、iframe を描画させない", async () => {
    const mod = await withUrl("");
    expect(mod.bookingEmbedUrl()).toBeNull();
    expect(mod.bookingPageUrl()).toBeNull();
    expect(mod.isBookingConfigured()).toBe(false);
  });

  it("不正なURLでも null を返す（ダミーURLを作らない）", async () => {
    const mod = await withUrl("https://evil.test/booking");
    expect(mod.bookingEmbedUrl()).toBeNull();
    expect(mod.isBookingConfigured()).toBe(false);
  });
});

describe("予約導線", () => {
  it("予約CTAはサイト内の予約ページへ向く", () => {
    const link = bookingLink("ja");
    expect(link.href).toBe(`/ja${routes.booking.path}`);
    expect(link.external).toBe(false);
  });

  it("予約URLが未設定でも行き止まりのリンクにならない", () => {
    // 予約ページ側で「準備中の案内＋連絡先」を出すため、リンク自体は常に有効です
    expect(bookingLink("en").href).not.toMatch(/\{\{.*\}\}/);
    expect(bookingLink("en").isConfigured).toBe(true);
  });

  it("予約ページは検索エンジンに公開する（noindex を付けない）", () => {
    expect(routes.booking.priority).toBeGreaterThanOrEqual(0.8);
  });

  it("ヘッダーのナビに予約を並べない（予約ボタンと導線が重複するため）", () => {
    // 同じ遷移先のリンクを2つ並べると迷わせるうえ、
    // その幅をSNSアイコンに使っています
    expect(mainNavKeys).not.toContain("booking");
  });

  it("予約ページはサイトマップに含まれる（ナビに無くても検索対象）", () => {
    expect(allRoutes.map((route) => route.key)).toContain("booking");
  });
});

describe("予約ページの文言", () => {
  const all = { ja, en, "zh-cn": zhCn, "zh-tw": zhTw, ko };

  it("5言語すべてに必要な文言がそろっている", () => {
    for (const [locale, messages] of Object.entries(all)) {
      const booking = messages.booking;
      expect(booking.title, locale).toBeTruthy();
      expect(booking.frameTitle, locale).toBeTruthy();
      expect(booking.loading, locale).toBeTruthy();
      expect(booking.fallbackButton, locale).toBeTruthy();
      expect(booking.notConfigured.heading, locale).toBeTruthy();
      expect(Object.keys(booking.notices), locale).toHaveLength(5);
      expect(Object.keys(booking.policies), locale).toHaveLength(9);
    }
  });

  it("予約完了を断定する表現を使っていない（完了判定はGoogleのメールのみ）", () => {
    // サイト側は予約完了を検知できないため、「予約が完了しました」とは書きません
    const text = JSON.stringify(ja.booking);
    expect(text).not.toContain("ご予約が完了しました");
    expect(ja.booking.after.mailIsConfirmation).toContain("確認メール");
  });

  it("禁止表現を含まない", () => {
    const text = JSON.stringify(ja.booking);
    for (const forbidden of ["傷まない", "絶対に", "治療", "No.1"]) {
      expect(text).not.toContain(forbidden);
    }
  });
});
