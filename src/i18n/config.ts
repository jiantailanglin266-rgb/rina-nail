/**
 * 多言語設定の単一の情報源。
 * 言語を追加するときは `locales` に追記し、`src/i18n/messages/<locale>.json` を作成してください。
 */

export const locales = ["ja", "en", "zh-cn", "zh-tw", "ko"] as const;

export type Locale = (typeof locales)[number];

/** 原文の言語。翻訳ファイルはすべてこの言語を基準に作成します。 */
export const defaultLocale: Locale = "ja";

/** 言語切り替えUIに表示する名称（各言語の自称表記） */
export const localeNames: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  "zh-cn": "简体中文",
  "zh-tw": "繁體中文",
  ko: "한국어",
};

/** <html lang> と hreflang に使うBCP 47タグ */
export const localeHtmlLang: Record<Locale, string> = {
  ja: "ja",
  en: "en",
  "zh-cn": "zh-Hans",
  "zh-tw": "zh-Hant",
  ko: "ko",
};

/** Open Graph の og:locale */
export const localeOgLocale: Record<Locale, string> = {
  ja: "ja_JP",
  en: "en_US",
  "zh-cn": "zh_CN",
  "zh-tw": "zh_TW",
  ko: "ko_KR",
};

/** 言語選択を保存するCookie名 */
export const localeCookieName = "NEXT_LOCALE";

/** Cookieの保存期間（1年） */
export const localeCookieMaxAge = 60 * 60 * 24 * 365;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Accept-Language ヘッダーから対応言語を推定します。
 * 中国語は簡体字／繁体字の区別が必要なため、地域サブタグまで見て判定します。
 */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;

  const candidates = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.split("=")[1]) : 1 };
    })
    .filter((c) => c.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of candidates) {
    const locale = normalizeTag(tag);
    if (locale) return locale;
  }

  return defaultLocale;
}

function normalizeTag(tag: string): Locale | null {
  if (tag.startsWith("ja")) return "ja";
  if (tag.startsWith("ko")) return "ko";
  if (tag.startsWith("zh")) {
    // zh-tw / zh-hk / zh-mo / zh-hant を繁体字、それ以外の中国語を簡体字に割り当てます
    if (/(^|-)(tw|hk|mo|hant)(-|$)/.test(tag)) return "zh-tw";
    return "zh-cn";
  }
  if (tag.startsWith("en")) return "en";
  return null;
}
