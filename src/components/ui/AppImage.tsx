import Image, { type ImageProps } from "next/image";

import { withBasePath } from "@/lib/base-path";

type Props = Omit<ImageProps, "src"> & {
  /** `/images/...` から始まる public 配下のパス */
  src: string;
};

/**
 * `next/image` のラッパー。
 *
 * GitHub Pages 向けの静的エクスポート（`output: "export"` ＋ `images.unoptimized`）では、
 * next/image が src に basePath を付けません。
 * その結果 `/rina-nail/images/...` ではなく `/images/...` を参照してしまい、
 * すべての画像が404になります。
 *
 * このコンポーネントを経由することで basePath を必ず付与します。
 * 通常のビルド（Vercel など）では basePath が空文字のため、何も変わりません。
 *
 * **public 配下の画像は、必ずこのコンポーネントを使ってください。**
 */
export function AppImage({ src, alt, ...props }: Props) {
  // alt はスプレッドに含めず明示的に渡します（型でも必須、ESLintでも検出可能にするため）
  return <Image src={withBasePath(src)} alt={alt} {...props} />;
}
