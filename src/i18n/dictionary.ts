import "server-only";

import ja from "./messages/ja.json";
import type { Locale } from "./config";

/**
 * 日本語を原文とし、その構造を全言語の型とします。
 * 他言語のJSONにキーの欠落があると `npm run typecheck` で検出されます。
 */
export type Messages = typeof ja;

const dictionaries: Record<Locale, () => Promise<Messages>> = {
  ja: async () => ja,
  en: () => import("./messages/en.json").then((m) => m.default),
  "zh-cn": () => import("./messages/zh-cn.json").then((m) => m.default),
  "zh-tw": () => import("./messages/zh-tw.json").then((m) => m.default),
  ko: () => import("./messages/ko.json").then((m) => m.default),
};

/**
 * サーバーコンポーネントから呼び出して翻訳データを取得します。
 * 翻訳ファイルはサーバー側でのみ読み込まれるため、
 * クライアントJSのバンドルサイズには影響しません。
 */
export async function getMessages(locale: Locale): Promise<Messages> {
  return dictionaries[locale]();
}

/**
 * "{price}〜" のようなプレースホルダーを差し込みます。
 * 翻訳側で語順が変わっても、キー名で対応関係が保たれます。
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
