import type { MetadataRoute } from "next";

import { allRoutes } from "@/data/navigation";
import { locales } from "@/i18n/config";
import { absoluteUrl, buildLanguageAlternates } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * 全言語 × 全ページのURLを出力します。
 * 各エントリに hreflang（x-default 含む）を付けるため、
 * 検索エンジンが言語別ページの対応関係を正しく認識できます。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return locales.flatMap((locale) =>
    allRoutes.map((route) => ({
      url: absoluteUrl(locale, route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: buildLanguageAlternates(route.path) },
    })),
  );
}
