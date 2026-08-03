import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import {
  Cormorant_Garamond,
  Montserrat,
  Noto_Sans_JP,
  Shippori_Mincho,
  Zen_Kaku_Gothic_New,
} from "next/font/google";

import "../globals.css";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { FloatingBookingButton } from "@/components/layout/FloatingBookingButton";
import { SkipLink } from "@/components/layout/SkipLink";
import { JsonLd } from "@/components/ui/JsonLd";
import { routes } from "@/data/navigation";
import { defaultOgImage, siteName, siteUrl } from "@/data/site";
import { isLocale, localeHtmlLang, localeOgLocale, locales, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionary";
import { withBasePath } from "@/lib/base-path";
import type { LocaleLayoutProps, LocalePageProps } from "@/lib/route-params";
import { absoluteUrl, buildLanguageAlternates } from "@/lib/seo";
import { personJsonLd, salonJsonLd, websiteJsonLd } from "@/lib/structured-data";

/* ------------------------------------------------------------
   フォント
   高級感のある英字セリフ体（Cormorant Garamond）と、
   読みやすい日本語ゴシック体（Noto Sans JP / Zen Kaku Gothic New）の組み合わせ。
   日本語フォントは容量が大きいため preload せず、display: swap で描画を止めません。
   ------------------------------------------------------------ */
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: false,
});

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-zen-kaku",
  display: "swap",
  preload: false,
});

const shippori = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-shippori",
  display: "swap",
  preload: false,
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

/** 5言語ぶんのページをビルド時に静的生成します */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const messages = await getMessages(locale);
  const home = messages.seo.home;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: home.title,
      template: `%s | ${siteName}`,
    },
    description: home.description,
    applicationName: siteName,
    keywords: messages.seo.keywords,
    authors: [{ name: siteName }],
    alternates: {
      canonical: absoluteUrl(locale, routes.home.path),
      languages: buildLanguageAlternates(routes.home.path),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      type: "website",
      locale: localeOgLocale[locale],
      url: absoluteUrl(locale, routes.home.path),
      siteName,
      title: home.title,
      description: home.description,
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: home.title,
      description: home.description,
      images: [defaultOgImage],
    },
    icons: {
      icon: [{ url: withBasePath("/icon.png"), type: "image/png" }],
      apple: [{ url: withBasePath("/apple-touch-icon.png"), sizes: "180x180" }],
    },
    formatDetection: { telephone: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale: Locale = locale;
  const messages = await getMessages(typedLocale);

  return (
    <html
      lang={localeHtmlLang[typedLocale]}
      className={`${notoSansJp.variable} ${zenKaku.variable} ${shippori.variable} ${cormorant.variable} ${montserrat.variable}`}
    >
      <body className="antialiased">
        {/*
          スクロール表示（Reveal）は初期状態が opacity: 0 のため、
          JavaScript が無効・読み込み失敗の場合に中身が見えなくなります。
          その場合はアニメーションを打ち消して即表示します。
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>

        <SkipLink label={messages.common.skipToContent} />
        <Header locale={typedLocale} messages={messages} />

        {/* モバイル固定バーの高さぶん、本文下部に余白を確保します */}
        <main id="main" className="pb-24 lg:pb-0">
          {children}
        </main>

        <Footer locale={typedLocale} messages={messages} />
        <FloatingBookingButton locale={typedLocale} messages={messages} />

        {/* サイト全体に共通する構造化データ（各ページ側で WebPage / パンくずを追加します） */}
        <JsonLd
          data={[
            websiteJsonLd(typedLocale, messages),
            salonJsonLd(typedLocale, messages),
            personJsonLd(messages),
          ]}
        />
      </body>
    </html>
  );
}
