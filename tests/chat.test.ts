import { describe, expect, it } from "vitest";

import en from "@/i18n/messages/en.json";
import ja from "@/i18n/messages/ja.json";
import ko from "@/i18n/messages/ko.json";
import zhCn from "@/i18n/messages/zh-cn.json";
import zhTw from "@/i18n/messages/zh-tw.json";
import { buildKnowledge, quickReplies, quickReplyIds } from "@/lib/chat/knowledge";
import { buildIndex, findAnswer } from "@/lib/chat/match";
import { tokenize } from "@/lib/chat/tokenize";

describe("トークン化", () => {
  it("日本語は1文字と2文字の並びに分解する", () => {
    const tokens = tokenize("営業時間");
    expect(tokens.has("営業")).toBe(true);
    expect(tokens.has("時間")).toBe(true);
    expect(tokens.has("業時")).toBe(true);
  });

  it("英語は単語のまま扱う", () => {
    const tokens = tokenize("Opening hours?");
    expect(tokens.has("opening")).toBe(true);
    expect(tokens.has("hours")).toBe(true);
  });

  it("記号や大文字小文字の違いを吸収する", () => {
    expect(tokenize("PARKING!!")).toEqual(tokenize("parking"));
  });

  it("空文字では何も返さない", () => {
    expect(tokenize("   ").size).toBe(0);
  });
});

describe("知識ベース", () => {
  const entries = buildKnowledge("ja", ja);

  it("よくある質問の全項目とデータ項目を含む", () => {
    const faqCount = ja.faq.groups.reduce((total, group) => total + group.items.length, 0);
    expect(entries.length).toBe(faqCount + 8);
  });

  it("回答が空の項目が無い", () => {
    for (const entry of entries) {
      expect(entry.question.trim().length).toBeGreaterThan(0);
      expect(entry.answer.trim().length).toBeGreaterThan(0);
    }
  });

  it("IDが重複していない", () => {
    const ids = entries.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("回答にプレースホルダーが混入しない", () => {
    for (const entry of entries) {
      expect(entry.answer).not.toMatch(/\{\{[A-Z_]+\}\}/);
    }
  });

  it("営業時間の回答が実際のデータと一致する（水曜は16:00）", () => {
    const hours = entries.find((entry) => entry.id === "hours");
    expect(hours?.answer).toContain("水曜日: 10:00〜16:00");
    expect(hours?.answer).toContain("土曜日: 定休日");
  });

  it("クイック返信が定義した5件そろう", () => {
    expect(quickReplies(entries)).toHaveLength(quickReplyIds.length);
  });
});

describe("回答の検索", () => {
  const index = buildIndex(buildKnowledge("ja", ja));

  /** 実際に入力されそうな聞き方で、正しい項目に当たるかを確認します */
  const cases: [string, string][] = [
    ["営業時間は？", "hours"],
    ["何時までやってますか", "hours"],
    ["日曜日はお休みですか", "hours"],
    ["駐車場ありますか", "faq-parking"],
    ["車で行けますか", "faq-parking"],
    ["場所はどこですか", "access"],
    ["行き方を教えて", "access"],
    ["料金はいくら", "price"],
    ["値段が知りたい", "price"],
    ["予約したいです", "booking"],
    ["当日予約できますか", "faq-sameDay"],
    ["カードは使えますか", "faq-payment"],
    ["初めてなんですが大丈夫ですか", "faq-firstTime"],
    ["フィルインって何ですか", "faq-fillIn"],
    ["施術の流れを知りたい", "flow"],
    ["デザインの写真が見たい", "gallery"],
    ["どんなメニューがありますか", "menu"],
    // 別の言い方でも同じ項目に当たること（手がかり語が効いているかの確認）
    ["男性でも行けますか", "faq-mens"],
    ["メンズネイルやってますか", "faq-mens"],
    ["爪が薄いのですが大丈夫ですか", "faq-weakNails"],
    ["何時間くらいかかりますか", "faq-duration"],
    ["土曜日はやってますか", "hours"],
    ["時間外でも予約できますか", "faq-afterHours"],
    ["駐車場は何台停められますか", "faq-parking"],
    ["クレジットカード使える？", "faq-payment"],
    ["オフだけお願いできますか", "faq-offFee"],
    ["持ち込みデザインOK？", "gallery"],
  ];

  for (const [question, expectedId] of cases) {
    it(`「${question}」→ ${expectedId}`, () => {
      const { best, suggestions } = findAnswer(question, index);
      const matched = best?.id ?? suggestions[0]?.id;
      expect(matched).toBe(expectedId);
    });
  }

  it("関係のない質問には回答を返さない", () => {
    const { best, suggestions } = findAnswer("今日の天気を教えて", index);
    expect(best).toBeNull();
    expect(suggestions.length).toBeLessThanOrEqual(3);
  });

  it("空文字では何も返さない", () => {
    expect(findAnswer("", index)).toEqual({ best: null, suggestions: [] });
  });

  it("助詞や丁寧語だけの入力には回答しない", () => {
    // 「〜を教えてください」はどの項目の質問文にも出てくるため、
    // これだけで回答してしまうと、無関係な質問に答えたように見えます
    for (const filler of ["教えてください", "ですか？", "お願いします", "それで"]) {
      expect(findAnswer(filler, index).best).toBeNull();
    }
  });

  it("関係のない固有名詞には回答しない", () => {
    for (const question of ["今日の天気は", "電車の時刻表", "近くのラーメン屋"]) {
      expect(findAnswer(question, index).best).toBeNull();
    }
  });

  it("あいさつや意味のない入力には候補も出さない", () => {
    for (const question of ["こんにちは", "ありがとう", "あああ", "???"]) {
      const result = findAnswer(question, index);
      expect(result.best).toBeNull();
      expect(result.suggestions).toHaveLength(0);
    }
  });
});

describe("回答に含める導線", () => {
  const entries = buildKnowledge("ja", ja);

  it("予約URLが未設定でも、行き止まりのリンクにしない", () => {
    const booking = entries.find((entry) => entry.id === "booking");
    expect(booking?.link?.href).not.toMatch(/\{\{.*\}\}/);
    expect(booking?.link?.href.startsWith("/")).toBe(true);
  });

  it("すべての項目の導線にラベルとURLがある", () => {
    for (const entry of entries) {
      if (!entry.link) continue;
      expect(entry.link.label.length).toBeGreaterThan(0);
      expect(entry.link.href.length).toBeGreaterThan(0);
    }
  });
});

describe("多言語での検索", () => {
  const cases: [string, typeof ja, string, string][] = [
    ["en", en as unknown as typeof ja, "What are your opening hours?", "hours"],
    ["en", en as unknown as typeof ja, "Is there parking?", "faq-parking"],
    ["en", en as unknown as typeof ja, "How much does it cost?", "price"],
    ["zh-cn", zhCn as unknown as typeof ja, "营业时间是几点", "hours"],
    ["zh-cn", zhCn as unknown as typeof ja, "有停车场吗", "faq-parking"],
    ["zh-tw", zhTw as unknown as typeof ja, "營業時間是幾點", "hours"],
    ["ko", ko as unknown as typeof ja, "영업시간을 알려주세요", "hours"],
    ["ko", ko as unknown as typeof ja, "주차장이 있나요", "faq-parking"],
  ];

  for (const [locale, messages, question, expectedId] of cases) {
    it(`[${locale}]「${question}」→ ${expectedId}`, () => {
      const index = buildIndex(buildKnowledge(locale as "ja", messages));
      const { best, suggestions } = findAnswer(question, index);
      expect(best?.id ?? suggestions[0]?.id).toBe(expectedId);
    });
  }

  it("5言語すべてで知識ベースが同じ件数になる", () => {
    const counts = [ja, en, zhCn, zhTw, ko].map(
      (messages) => buildKnowledge("ja", messages as unknown as typeof ja).length,
    );
    expect(new Set(counts).size).toBe(1);
  });
});
