import { localeCookieMaxAge, localeCookieName, type Locale } from "@/i18n/config";

/**
 * 選択した言語をCookieへ保存します。
 * 次回「/」へアクセスしたとき、proxy.ts がこの値を見て同じ言語へ振り分けます。
 */
export function saveLocalePreference(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.cookie = `${localeCookieName}=${locale}; path=/; max-age=${localeCookieMaxAge}; samesite=lax`;
}
