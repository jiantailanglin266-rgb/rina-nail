import type { MetadataRoute } from "next";

import { siteName, siteNameKana, store } from "@/data/site";
import { withBasePath } from "@/lib/base-path";

export const dynamic = "force-static";

/**
 * Web App Manifest。
 *
 * スマートフォンで「ホーム画面に追加」したときの表示名・アイコン・テーマ色を定義します。
 * 予約前に何度も見比べられるサイトなので、再訪しやすくすることを狙っています。
 *
 * `start_url` / `icons` には basePath を付けます
 * （GitHub Pages はサブディレクトリ配信のため、付けないと404になります）。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName}（${siteNameKana}）｜${store.address.city}のプライベートネイルサロン`,
    short_name: siteName,
    description:
      "三重県四日市市平尾町の完全予約制・完全プライベートネイルサロン。爪への負担を抑えたフィルイン施術に対応しています。",
    lang: "ja",
    start_url: withBasePath("/ja/"),
    scope: withBasePath("/"),
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["beauty", "lifestyle", "shopping"],
    icons: [
      {
        src: withBasePath("/icon.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: withBasePath("/apple-touch-icon.png"),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
