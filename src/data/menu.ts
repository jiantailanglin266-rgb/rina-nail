/**
 * メニュー・クーポンの構造データ。
 *
 * 表示名や説明文は翻訳ファイル（`menu.items.<id>` / `menu.coupons.<id>`）側に持たせ、
 * ここでは価格と属性だけを扱います。将来CMSへ移す場合もこの型のまま差し替えられます。
 *
 * 価格はすべて税込・日本円です。
 * 金額が未確定のメニューは `price: null` とし、`pricePlaceholder` に
 * 差し替え用のプレースホルダーキーを入れています。
 */

export type MenuCategory = "base" | "art" | "option" | "care";

export type MenuItem = {
  id: string;
  category: MenuCategory;
  /** 税込価格（円）。未確定の場合は null */
  price: number | null;
  /** 「〜」を付けて下限として表示するか */
  from?: boolean;
  /** price が null のときに表示するプレースホルダー */
  pricePlaceholder?: string;
  /** フィルイン対応メニューか */
  fillIn?: boolean;
  /** オフ込みか */
  offIncluded?: boolean;
};

export const menuItems: MenuItem[] = [
  {
    id: "oneColor",
    category: "base",
    price: 5500,
    from: true,
    fillIn: true,
    offIncluded: true,
  },
  {
    id: "artDesign",
    category: "art",
    price: null,
    pricePlaceholder: "{{PRICE_ART_DESIGN}}",
    fillIn: true,
    offIncluded: true,
  },
  {
    id: "unlimitedArt",
    category: "art",
    price: null,
    pricePlaceholder: "{{PRICE_UNLIMITED_ART}}",
    fillIn: true,
  },
  {
    id: "off",
    category: "option",
    price: null,
    pricePlaceholder: "{{PRICE_OFF}}",
  },
  {
    id: "care",
    category: "care",
    price: null,
    pricePlaceholder: "{{PRICE_CARE}}",
  },
];

export type Coupon = {
  id: string;
  /** 税込価格（円） */
  price: number;
  /** 通常価格（円）。設定した場合のみ取り消し線付きで併記します */
  regularPrice?: number;
  /** 初回来店限定か */
  firstTimeOnly: boolean;
  /** 利用できる時間帯（平日13:00〜16:00 など）。翻訳キー側で文章化します */
  hasTimeLimit: boolean;
};

export const coupons: Coupon[] = [
  {
    id: "firstDesign",
    price: 7000,
    regularPrice: 7500,
    firstTimeOnly: true,
    hasTimeLimit: false,
  },
  {
    id: "weekdayOneColor",
    price: 5000,
    firstTimeOnly: true,
    hasTimeLimit: true,
  },
];

/** 全オフの追加料金（1本あたりの下限・税込） */
export const offSurchargePerNail = 100;

/**
 * 金額を各言語向けに整形します。
 * 通貨は常に日本円です（日本語は「5,000円」、その他の言語は「¥5,000」）。
 */
export function formatPrice(amount: number, locale: string): string {
  const formatted = new Intl.NumberFormat("ja-JP").format(amount);
  return locale === "ja" ? `${formatted}円` : `¥${formatted}`;
}
