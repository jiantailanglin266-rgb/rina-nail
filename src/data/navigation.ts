/**
 * サイト内のルート定義。
 * ページ追加時はここに追記すれば、ナビ・フッター・sitemap.xml・パンくずに反映されます。
 */

import type { Locale } from "@/i18n/config";

/** 翻訳ファイルの `nav.<key>` と対応するキー */
export type RouteKey =
  | "home"
  | "menu"
  | "gallery"
  | "fillIn"
  | "firstVisit"
  | "access"
  | "faq"
  | "about"
  | "booking"
  | "privacy"
  | "terms";

export type Route = {
  key: RouteKey;
  /** ロケールを除いたパス。トップは "" */
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
};

export const routes: Record<RouteKey, Route> = {
  home: { key: "home", path: "", changeFrequency: "weekly", priority: 1 },
  menu: { key: "menu", path: "/menu", changeFrequency: "monthly", priority: 0.9 },
  gallery: { key: "gallery", path: "/gallery", changeFrequency: "monthly", priority: 0.8 },
  fillIn: { key: "fillIn", path: "/fill-in", changeFrequency: "monthly", priority: 0.9 },
  firstVisit: {
    key: "firstVisit",
    path: "/first-visit",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  access: { key: "access", path: "/access", changeFrequency: "monthly", priority: 0.8 },
  faq: { key: "faq", path: "/faq", changeFrequency: "monthly", priority: 0.7 },
  about: { key: "about", path: "/about", changeFrequency: "monthly", priority: 0.6 },
  // ネット予約。予約導線の着地点なので優先度を高くします
  booking: { key: "booking", path: "/booking", changeFrequency: "weekly", priority: 0.9 },
  privacy: { key: "privacy", path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  terms: { key: "terms", path: "/terms", changeFrequency: "yearly", priority: 0.2 },
};

export const allRoutes: Route[] = Object.values(routes);

/** ヘッダー・モバイルメニューに並べる主要ナビ */
export const mainNavKeys: RouteKey[] = [
  // 予約はナビの先頭に置きます（最も押してほしい導線のため）
  "booking",
  "menu",
  "gallery",
  "fillIn",
  "firstVisit",
  "access",
  "faq",
  "about",
];

/** フッター下段の規約系リンク */
export const utilityNavKeys: RouteKey[] = ["privacy", "terms"];

/** ロケール付きの内部パスを作ります（例: localeHref("en", "/menu") -> "/en/menu"） */
export function localeHref(locale: Locale, path: string): string {
  return `/${locale}${path}`;
}
