import type { ReactNode } from "react";

/**
 * `app/[locale]/**` のページ／レイアウトが受け取る props。
 *
 * Next.js は `.next/types` にグローバルの `PageProps` / `LayoutProps` を生成しますが、
 * ビルド前（クリーンな状態での `npm run typecheck`）では存在しないため、
 * 明示的な型をこのファイルで定義しています。
 */
export type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export type LocaleLayoutProps = LocalePageProps & {
  children: ReactNode;
};
