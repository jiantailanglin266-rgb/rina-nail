/**
 * サイト全体で使う設定値・外部URL・店舗のNAP情報。
 *
 * ここが唯一の情報源です。連絡先や予約URLを変更する場合は
 * このファイルだけを編集してください（構造化データ・本文・フッターに自動反映されます）。
 */

/** 本番の正規URL。デプロイ先が決まったら .env.local / Vercel の環境変数で上書きします。 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://rina-nail.example.com"
).replace(/\/$/, "");

/** 店舗名（全言語・全ページで表記を統一します。翻訳しません） */
export const siteName = "Rina nail";

/** 日本語の読み仮名。表記揺れ防止のためここでのみ定義します。 */
export const siteNameKana = "リナネイル";

/**
 * 未確定の情報はプレースホルダーのまま出力します。
 * 実際の値が決まったら `.env.local` に設定するか、この既定値を直接書き換えてください。
 *
 * プレースホルダーが残っている項目は `isPlaceholder()` で判定でき、
 * UI 側では「未設定の導線を表示しない」制御に利用しています。
 */
export const placeholders = {
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "{{BOOKING_URL}}",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "{{INSTAGRAM_URL}}",
  lineUrl: process.env.NEXT_PUBLIC_LINE_URL ?? "{{LINE_URL}}",
  xUrl: process.env.NEXT_PUBLIC_X_URL ?? "{{X_URL}}",
  tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "{{TIKTOK_URL}}",
  youtubeUrl: process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "{{YOUTUBE_URL}}",
  facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "{{FACEBOOK_URL}}",
  phoneNumber: process.env.NEXT_PUBLIC_PHONE_NUMBER ?? "{{PHONE_NUMBER}}",
  latitude: process.env.NEXT_PUBLIC_LATITUDE ?? "{{LATITUDE}}",
  longitude: process.env.NEXT_PUBLIC_LONGITUDE ?? "{{LONGITUDE}}",
  mapEmbedUrl: process.env.NEXT_PUBLIC_MAP_EMBED_URL ?? "{{MAP_EMBED_URL}}",
} as const;

/** 値が未設定（プレースホルダーのまま）かどうか */
export function isPlaceholder(value: string): boolean {
  return /^\{\{.*\}\}$/.test(value.trim());
}

/** 未設定なら undefined を返します（JSON-LD から空項目を落とすために使用） */
export function resolved(value: string): string | undefined {
  return isPlaceholder(value) ? undefined : value;
}

/** tel: リンク用に整形（未設定なら undefined） */
export function telHref(value: string): string | undefined {
  const v = resolved(value);
  return v ? `tel:${v.replace(/[^0-9+]/g, "")}` : undefined;
}

/**
 * 店舗のNAP情報（Name / Address / Phone）。
 * 本文・フッター・構造化データはすべてここを参照するため、表記が揺れません。
 */
export const store = {
  name: siteName,
  nameKana: siteNameKana,
  owner: "中村 梨奈",
  ownerRomaji: "Rina Nakamura",
  /** ネイリスト歴（年） */
  careerYears: 10,
  address: {
    country: "JP",
    postalCode: "",
    region: "三重県",
    regionEn: "Mie",
    city: "四日市市",
    cityEn: "Yokkaichi",
    street: "平尾町3082-5",
    streetEn: "3082-5 Hirao-cho",
    /** 日本語の完全表記 */
    full: "三重県四日市市平尾町3082-5",
    /** 英語の完全表記 */
    fullEn: "3082-5 Hirao-cho, Yokkaichi, Mie, Japan",
  },
  /** チェア数 */
  seats: 1,
  /** スタッフ数 */
  staff: 1,
  priceRange: "¥¥",
  currency: "JPY",
} as const;

/**
 * 商圏（構造化データの `areaServed`）。
 *
 * 四日市市と、そこから来店しやすい三重県北勢エリアの自治体です。
 * 「対応エリア」の主張ではなく地理的な範囲の記述なので、
 * 実態に合わせて増減して構いません。
 */
export const areaServed = [
  { name: "四日市市", type: "City" },
  { name: "桑名市", type: "City" },
  { name: "鈴鹿市", type: "City" },
  { name: "いなべ市", type: "City" },
  { name: "菰野町", type: "AdministrativeArea" },
  { name: "朝日町", type: "AdministrativeArea" },
  { name: "川越町", type: "AdministrativeArea" },
  { name: "東員町", type: "AdministrativeArea" },
] as const;

/** 予約・SNS導線 */
export const links = {
  booking: placeholders.bookingUrl,
  instagram: placeholders.instagramUrl,
  phone: placeholders.phoneNumber,
} as const;

/**
 * Googleマップの埋め込みURLを組み立てます。
 *
 * APIキー不要の埋め込み方式で、住所（`store.address.full`）から生成します。
 * 住所は `src/data/site.ts` の一元管理データなので、住所を変更すれば地図も追従します。
 *
 * `NEXT_PUBLIC_MAP_EMBED_URL` が設定されている場合はそちらを優先します
 * （Maps Embed API のURLや、Place ID でピンを正確に指定したURLへ差し替える用）。
 */
export function mapEmbedUrl(locale: string): string {
  const override = resolved(placeholders.mapEmbedUrl);
  if (override) return override;

  // Googleマップの言語パラメータ（hl）へ変換します
  const hl =
    locale === "zh-cn" ? "zh-CN" : locale === "zh-tw" ? "zh-TW" : locale === "ko" ? "ko" : locale;

  const query = encodeURIComponent(store.address.full);
  return `https://www.google.com/maps?q=${query}&z=16&hl=${hl}&output=embed`;
}

/** 「Googleマップで開く」用のURL（地図アプリでも開けます） */
export function mapLinkUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address.full)}`;
}

/**
 * 構造化データの sameAs に入れるSNS（未設定のものは除外されます）。
 *
 * 表示用のアイコン一覧（`src/data/social.ts`）と同じ情報源なので、
 * SNSを追加すると JSON-LD とヘッダー・フッターの両方に反映されます。
 */
export function sameAsUrls(): string[] {
  return [
    placeholders.instagramUrl,
    placeholders.lineUrl,
    placeholders.xUrl,
    placeholders.tiktokUrl,
    placeholders.youtubeUrl,
    placeholders.facebookUrl,
  ]
    .map(resolved)
    .filter((v): v is string => Boolean(v));
}

/** 対応する支払い方法（表示・構造化データ共通） */
export const paymentMethods = [
  "Visa",
  "Mastercard",
  "JCB",
  "American Express",
  "Apple Pay",
  "iD",
  "QUICPay",
] as const;

/** OGP画像の既定パス */
export const defaultOgImage = "/images/common/ogp.png";
