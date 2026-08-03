import type { Metadata } from "next";

import { defaultOgImage, siteName, siteUrl } from "@/data/site";
import { routes, type RouteKey } from "@/data/navigation";
import { defaultLocale, locales, localeHtmlLang, localeOgLocale, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";

/** ロケール付きの絶対URLを作ります */
export function absoluteUrl(locale: Locale, path: string): string {
  return `${siteUrl}/${locale}${path}`;
}

/**
 * hreflang（各言語 + x-default）を作ります。
 * x-default には原文である日本語版を割り当てます。
 */
export function buildLanguageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    languages[localeHtmlLang[locale]] = absoluteUrl(locale, path);
  }
  languages["x-default"] = absoluteUrl(defaultLocale, path);

  return languages;
}

type PageMetadataInput = {
  locale: Locale;
  messages: Messages;
  routeKey: RouteKey;
  /** OGP画像を差し替える場合に指定します */
  image?: string;
};

/**
 * ページ単位のメタデータを生成します。
 * title / description / canonical / hreflang / OGP / Twitter Card を
 * すべて翻訳ファイル（seo.<routeKey>）から組み立てます。
 */
export function pageMetadata({
  locale,
  messages,
  routeKey,
  image = defaultOgImage,
}: PageMetadataInput): Metadata {
  const seo = messages.seo[routeKey];
  const path = routes[routeKey].path;
  const url = absoluteUrl(locale, path);
  const isHome = routeKey === "home";
  const fullTitle = isHome ? seo.title : `${seo.title} | ${siteName}`;

  return {
    title: seo.title,
    description: seo.description,
    keywords: messages.seo.keywords,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(path),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      type: "website",
      url,
      siteName,
      title: fullTitle,
      description: seo.description,
      locale: localeOgLocale[locale],
      images: [{ url: image, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: seo.description,
      images: [image],
    },
  };
}
