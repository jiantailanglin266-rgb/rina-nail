import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * 予約APIクライアントのテスト。
 *
 * 実際の Google Apps Script は呼ばず、`fetch` を差し替えて検証します
 * （外部サービスに依存するテストは、相手の状態でしか壊れないため）。
 */

const API_URL = "https://script.google.com/macros/s/test/exec";

// モジュールの読み込み時に環境変数を見るため、先に設定します
vi.stubEnv("NEXT_PUBLIC_BOOKING_API_URL", API_URL);

const {
  BookingError,
  cancelBooking,
  createBooking,
  createIdempotencyKey,
  fetchAvailability,
  rescheduleBooking,
} = await import("@/lib/booking/api");

const form = {
  name: "山田 花子",
  kana: "ヤマダ ハナコ",
  phone: "09012345678",
  email: "hanako@example.com",
  agreeTerms: true,
  agreeCancel: true,
  agreePrivacy: true,
};

function mockFetch(response: unknown, init: { ok?: boolean } = {}) {
  const fn = vi.fn(async () =>
    new Response(JSON.stringify(response), {
      status: init.ok === false ? 500 : 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("空き状況の取得", () => {
  it("予約不可の時間帯を返す", async () => {
    mockFetch({
      ok: true,
      data: { busy: [{ start: "2026-08-10T11:00:00+09:00", end: "2026-08-10T12:00:00+09:00" }], reservationCount: 1 },
    });

    const result = await fetchAvailability({ date: "2026-08-10" });
    expect(result.busy).toHaveLength(1);
    expect(result.reservationCount).toBe(1);
  });

  it("プリフライトを避けるため text/plain で送る", async () => {
    // Apps Script は OPTIONS に応答しないため、単純リクエストに収める必要があります
    const fn = mockFetch({ ok: true, data: { busy: [], reservationCount: 0 } });
    await fetchAvailability({ date: "2026-08-10" });

    const [, init] = fn.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)["Content-Type"]).toContain("text/plain");
    expect(init.method).toBe("POST");
  });
});

describe("予約の作成", () => {
  const input = {
    menuId: "oneColor",
    optionIds: [],
    startIso: "2026-08-10T14:00:00+09:00",
    form,
    locale: "ja",
    idempotencyKey: "key-1",
  };

  it("予約IDと管理用トークンを受け取る", async () => {
    mockFetch({
      ok: true,
      data: {
        reservationId: "RN20260810ABC123",
        manageToken: "token",
        startIso: input.startIso,
        endIso: "2026-08-10T15:15:00+09:00",
        duplicated: false,
      },
    });

    const result = await createBooking(input);
    expect(result.reservationId).toBe("RN20260810ABC123");
    expect(result.duplicated).toBe(false);
  });

  it("同じ鍵で再送された場合は duplicated が返り、二重登録にならない", async () => {
    mockFetch({
      ok: true,
      data: {
        reservationId: "RN20260810ABC123",
        manageToken: "token",
        startIso: input.startIso,
        endIso: "2026-08-10T15:15:00+09:00",
        duplicated: true,
      },
    });

    const result = await createBooking(input);
    expect(result.duplicated).toBe(true);
  });

  it("確定直前に枠が埋まった場合は slotTaken を投げる", async () => {
    mockFetch({ ok: false, code: "slotTaken" });
    await expect(createBooking(input)).rejects.toMatchObject({ code: "slotTaken" });
  });

  it("営業時間外は outsideHours を投げる", async () => {
    mockFetch({ ok: false, code: "outsideHours" });
    await expect(createBooking(input)).rejects.toMatchObject({ code: "outsideHours" });
  });

  it("1日の上限に達している場合は dailyLimit を投げる", async () => {
    mockFetch({ ok: false, code: "dailyLimit" });
    await expect(createBooking(input)).rejects.toMatchObject({ code: "dailyLimit" });
  });

  it("通信に失敗した場合は network を投げる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("failed to fetch");
      }),
    );
    await expect(createBooking(input)).rejects.toMatchObject({ code: "network" });
  });

  it("応答がJSONでない場合も、技術的な例外を外へ出さない", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>error</html>", { status: 200 })));
    const error = await createBooking(input).catch((e) => e);
    expect(error).toBeInstanceOf(BookingError);
    expect(error.code).toBe("unknown");
  });
});

describe("変更・キャンセル", () => {
  it("トークンが不正なら invalidToken を投げる", async () => {
    mockFetch({ ok: false, code: "invalidToken" });
    await expect(
      rescheduleBooking({ token: "bad", startIso: "2026-08-11T14:00:00+09:00", idempotencyKey: "k" }),
    ).rejects.toMatchObject({ code: "invalidToken" });
  });

  it("期限切れトークンは expiredToken を投げる", async () => {
    mockFetch({ ok: false, code: "expiredToken" });
    await expect(cancelBooking({ token: "old", idempotencyKey: "k" })).rejects.toMatchObject({
      code: "expiredToken",
    });
  });

  it("キャンセル済みの再キャンセルは alreadyCancelled を投げる", async () => {
    mockFetch({ ok: false, code: "alreadyCancelled" });
    await expect(cancelBooking({ token: "t", idempotencyKey: "k" })).rejects.toMatchObject({
      code: "alreadyCancelled",
    });
  });
});

describe("二重送信の防止", () => {
  it("鍵は毎回異なる値になる", () => {
    const keys = new Set(Array.from({ length: 50 }, () => createIdempotencyKey()));
    expect(keys.size).toBe(50);
  });

  it("crypto.randomUUID が無い環境でも鍵を作れる", () => {
    vi.stubGlobal("crypto", {});
    expect(createIdempotencyKey().length).toBeGreaterThan(5);
  });
});
