/**
 * ギャラリーの構造データ。
 *
 * 画像は `public/images/gallery/` に配置した仮画像を参照しています。
 * 実写に差し替えるときは同じファイル名で上書きするか、`src` を書き換えてください。
 * alt テキストは翻訳ファイル（`gallery.items.<id>.alt`）側で言語ごとに管理します。
 */

export const galleryCategories = [
  "simple",
  "office",
  "nuance",
  "glitter",
  "gorgeous",
  "seasonal",
  "mens",
] as const;

export type GalleryCategory = (typeof galleryCategories)[number];

export type GalleryItem = {
  id: string;
  category: GalleryCategory;
  src: string;
  width: number;
  height: number;
};

/** 仮画像は 1000x1250（4:5）で統一しています */
const W = 1000;
const H = 1250;

export const galleryItems: GalleryItem[] = [
  {
    id: "simple-01",
    category: "simple",
    src: "/images/gallery/simple-01.jpg",
    width: W,
    height: H,
  },
  {
    id: "simple-02",
    category: "simple",
    src: "/images/gallery/simple-02.jpg",
    width: W,
    height: H,
  },
  {
    id: "office-01",
    category: "office",
    src: "/images/gallery/office-01.jpg",
    width: W,
    height: H,
  },
  {
    id: "office-02",
    category: "office",
    src: "/images/gallery/office-02.jpg",
    width: W,
    height: H,
  },
  {
    id: "nuance-01",
    category: "nuance",
    src: "/images/gallery/nuance-01.jpg",
    width: W,
    height: H,
  },
  {
    id: "nuance-02",
    category: "nuance",
    src: "/images/gallery/nuance-02.jpg",
    width: W,
    height: H,
  },
  {
    id: "glitter-01",
    category: "glitter",
    src: "/images/gallery/glitter-01.jpg",
    width: W,
    height: H,
  },
  {
    id: "glitter-02",
    category: "glitter",
    src: "/images/gallery/glitter-02.jpg",
    width: W,
    height: H,
  },
  {
    id: "gorgeous-01",
    category: "gorgeous",
    src: "/images/gallery/gorgeous-01.jpg",
    width: W,
    height: H,
  },
  {
    id: "gorgeous-02",
    category: "gorgeous",
    src: "/images/gallery/gorgeous-02.jpg",
    width: W,
    height: H,
  },
  {
    id: "seasonal-01",
    category: "seasonal",
    src: "/images/gallery/seasonal-01.jpg",
    width: W,
    height: H,
  },
  {
    id: "seasonal-02",
    category: "seasonal",
    src: "/images/gallery/seasonal-02.jpg",
    width: W,
    height: H,
  },
  { id: "mens-01", category: "mens", src: "/images/gallery/mens-01.jpg", width: W, height: H },
  { id: "mens-02", category: "mens", src: "/images/gallery/mens-02.jpg", width: W, height: H },
];

/** トップページのギャラリーセクションで先出しする枚数 */
export const homeGalleryCount = 6;
