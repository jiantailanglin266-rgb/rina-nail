import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_JP } from "next/font/google";

import "./globals.css";

import { defaultLocale, localeHtmlLang, locales, localeNames } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionary";

/**
 * どのルートにも一致しなかったURLの404。
 *
 * ルートレイアウトが `app/[locale]/layout.tsx` にあるため、
 * このページはレイアウトを経由せず単独で描画されます。
 * そのためスタイル・フォントの読み込みをこのファイル内で行っています
 * （表示速度を優先し、フォントは2種類だけに絞っています）。
 */
const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: false,
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getMessages(defaultLocale);
  return {
    title: messages.seo.notFound.title,
    description: messages.seo.notFound.description,
    robots: { index: false, follow: true },
  };
}

export default async function GlobalNotFound() {
  const messages = await getMessages(defaultLocale);

  return (
    <html
      lang={localeHtmlLang[defaultLocale]}
      className={`${notoSansJp.variable} ${cormorant.variable}`}
    >
      <body className="antialiased">
        <main className="container-page flex min-h-screen flex-col items-center justify-center py-20 text-center">
          <p className="text-gradient text-gradient-signature font-display text-7xl leading-none sm:text-8xl">
            404
          </p>
          <h1 className="mt-6 text-2xl sm:text-3xl">{messages.notFound.title}</h1>
          <p className="text-muted mt-4 max-w-lg text-sm leading-relaxed">
            {messages.notFound.lead}
          </p>

          <ul className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            {locales.map((locale) => (
              <li key={locale}>
                <a
                  href={`/${locale}`}
                  lang={locale}
                  className="text-purple underline underline-offset-4"
                >
                  {localeNames[locale]}
                </a>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  );
}
