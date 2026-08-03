/**
 * SNSアカウントの定義。
 *
 * ヘッダー・フッター・モバイルメニューのアイコン、および構造化データの `sameAs` は
 * すべてここ（と `src/data/site.ts` のプレースホルダー）を情報源にしています。
 *
 * **URLが未設定（`{{...}}` のまま）のSNSは表示されません。**
 * 架空のアカウントを作らないための仕様です。実際のアカウントが決まったら
 * `.env.local` に `NEXT_PUBLIC_INSTAGRAM_URL` などを設定してください（`docs/PLACEHOLDERS.md`）。
 */

import { isPlaceholder, placeholders } from "@/data/site";

/** 対応しているSNSの種類 */
export type SocialKey = "instagram" | "line" | "x" | "tiktok" | "youtube" | "facebook";

export type SocialAccount = {
  key: SocialKey;
  /** 表示名。固有名詞のため翻訳しません */
  name: string;
  url: string;
  /**
   * ブランドカラー。ホバー時のリングやグローに使用します。
   * アイコン本体の配色は各アイコンコンポーネントが持っています。
   */
  brandColor: string;
};

/** 表示順（上から順にアイコンが並びます） */
const definitions: { key: SocialKey; name: string; url: string; brandColor: string }[] = [
  {
    key: "instagram",
    name: "Instagram",
    url: placeholders.instagramUrl,
    brandColor: "#E8437F",
  },
  { key: "line", name: "LINE", url: placeholders.lineUrl, brandColor: "#06C755" },
  { key: "tiktok", name: "TikTok", url: placeholders.tiktokUrl, brandColor: "#FE2C55" },
  { key: "x", name: "X", url: placeholders.xUrl, brandColor: "#0A0A0A" },
  { key: "youtube", name: "YouTube", url: placeholders.youtubeUrl, brandColor: "#FF0033" },
  { key: "facebook", name: "Facebook", url: placeholders.facebookUrl, brandColor: "#0866FF" },
];

/** 設定済みのSNSだけを返します（未設定のものは表示しません） */
export function socialAccounts(): SocialAccount[] {
  return definitions.filter((item) => !isPlaceholder(item.url));
}

/** 1件でも設定済みのSNSがあるか */
export function hasSocialAccounts(): boolean {
  return socialAccounts().length > 0;
}
