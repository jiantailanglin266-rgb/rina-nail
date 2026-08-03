import Link from "next/link";

import { AnimatedGoldBackground } from "@/components/animations/AnimatedGoldBackground";
import { GradientText } from "@/components/ui/GradientText";
import { mainNavKeys, routes } from "@/data/navigation";
import { defaultLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionary";

/**
 * ロケール配下の404。
 *
 * not-found.tsx は params を受け取れないため、表示は既定言語（日本語）になります。
 * 各言語のトップページへのリンクは言語切り替えUI（ヘッダー）から辿れます。
 */
export default async function LocaleNotFound() {
  const messages = await getMessages(defaultLocale);

  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <AnimatedGoldBackground density="soft" />

      <div className="container-page relative flex flex-col items-center text-center">
        <p className="font-display text-7xl leading-none sm:text-8xl">
          <GradientText variant="signature">404</GradientText>
        </p>
        <h1 className="mt-6 text-2xl sm:text-3xl">{messages.notFound.title}</h1>
        <p className="text-muted mt-4 max-w-lg text-sm leading-relaxed">{messages.notFound.lead}</p>

        <Link
          href={`/${defaultLocale}`}
          className="btn-sheen relative mt-8 inline-flex items-center justify-center overflow-hidden rounded-full [background-image:var(--gradient-signature)] px-8 py-4 text-base font-medium text-white"
        >
          {messages.notFound.backHome}
        </Link>

        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {mainNavKeys.map((key) => (
            <li key={key}>
              <Link
                href={`/${defaultLocale}${routes[key].path}`}
                className="text-purple hover:text-neon-pink underline underline-offset-4 transition"
              >
                {messages.nav[key]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
