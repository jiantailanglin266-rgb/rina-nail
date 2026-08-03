import { describe, expect, it } from "vitest";

import ja from "@/i18n/messages/ja.json";
import en from "@/i18n/messages/en.json";
import zhCn from "@/i18n/messages/zh-cn.json";
import zhTw from "@/i18n/messages/zh-tw.json";
import ko from "@/i18n/messages/ko.json";
import { locales, matchLocale, isLocale, localeHtmlLang } from "@/i18n/config";

type Json = Record<string, unknown>;

/** ネストしたキーをドット区切りのパス一覧に展開します */
function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    // 配列は要素数が言語で変わりうるため、先頭要素の構造だけを見ます
    return value.length > 0 ? keyPaths(value[0], `${prefix}[]`) : [prefix];
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Json).flatMap(([key, child]) =>
      keyPaths(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

const catalogues = { en, "zh-cn": zhCn, "zh-tw": zhTw, ko } as const;

describe("翻訳ファイル", () => {
  const jaPaths = keyPaths(ja).sort();

  it.each(Object.keys(catalogues))("%s は日本語版と同じキー構造を持つ", (locale) => {
    const target = catalogues[locale as keyof typeof catalogues];
    expect(keyPaths(target).sort()).toEqual(jaPaths);
  });

  it.each(Object.entries(catalogues))("%s に空文字の翻訳が無い", (_locale, catalogue) => {
    const empty = collectEmpty(catalogue);
    expect(empty).toEqual([]);
  });

  it("日本語版に空文字の翻訳が無い", () => {
    expect(collectEmpty(ja)).toEqual([]);
  });

  it("マーキーの英字部分は全言語で共通", () => {
    for (const catalogue of Object.values(catalogues)) {
      expect(catalogue.home.marquee.lineOne).toEqual(ja.home.marquee.lineOne);
    }
  });

  it("店舗名の表記が全言語で統一されている", () => {
    for (const catalogue of [ja, ...Object.values(catalogues)]) {
      expect(catalogue.footer.copyright).toBe("Rina nail");
    }
  });
});

function collectEmpty(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return value.trim().length === 0 ? [prefix] : [];
  if (Array.isArray(value))
    return value.flatMap((item, i) => collectEmpty(item, `${prefix}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value as Json).flatMap(([key, child]) =>
      collectEmpty(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

describe("ロケール判定", () => {
  it("対応言語を判別できる", () => {
    expect(locales.every(isLocale)).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("Accept-Language から言語を推定する", () => {
    expect(matchLocale("ja,en-US;q=0.9")).toBe("ja");
    expect(matchLocale("en-US,en;q=0.9")).toBe("en");
    expect(matchLocale("ko-KR,ko;q=0.9")).toBe("ko");
    // 中国語は地域サブタグまで見て簡体字／繁体字を出し分けます
    expect(matchLocale("zh-CN,zh;q=0.9")).toBe("zh-cn");
    expect(matchLocale("zh-TW,zh;q=0.9")).toBe("zh-tw");
    expect(matchLocale("zh-HK")).toBe("zh-tw");
    // 未対応の言語は原文（日本語）へ
    expect(matchLocale("fr-FR,fr;q=0.9")).toBe("ja");
    expect(matchLocale(null)).toBe("ja");
  });

  it("hreflang 用のタグが重複していない", () => {
    const tags = locales.map((locale) => localeHtmlLang[locale]);
    expect(new Set(tags).size).toBe(tags.length);
  });
});
