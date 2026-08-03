import { AppImage } from "@/components/ui/AppImage";
import { CalendarCheck, ChevronDown, Sparkles } from "lucide-react";

import { AnimatedGoldBackground } from "@/components/animations/AnimatedGoldBackground";
import { SalviaFlowerRain } from "@/components/animations/salvia/SalviaFlowerRain";
import { ColorfulGradientBackground } from "@/components/backgrounds/ColorfulGradientBackground";
import { ActionLink } from "@/components/ui/ActionLink";
import { InstagramIcon } from "@/components/ui/icons/InstagramIcon";
import { GradientText } from "@/components/ui/GradientText";
import { localeHref, routes } from "@/data/navigation";
import { isPlaceholder, links } from "@/data/site";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";

type Props = {
  locale: Locale;
  messages: Messages;
};

/**
 * ヒーロー。
 *
 * ファーストビュー内に主要CTA（予約・メニュー）を必ず収めています。
 * 画像は LCP 要素になるため `priority` を付け、明示的なサイズ指定で CLS を防ぎます。
 */
export function Hero({ locale, messages }: Props) {
  const hero = messages.home.hero;

  return (
    <section className="relative isolate overflow-hidden pt-16">
      {/* 第1〜3層：多層グラデーション＋カラーオーブ＋虹色の反射 */}
      <ColorfulGradientBackground preset="hero" intensity="high" className="-z-30" />
      {/* ゴールドの曲線・光粒 */}
      <AnimatedGoldBackground density="full" className="-z-20" />
      {/* 四日市市の花・サルビア。サイト内で最も密度を高くします */}
      <SalviaFlowerRain variant="hero" density="high" colorMode="mixed" className="-z-10" />

      <div className="container-page relative z-10 grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
        {/* テキスト（モバイルでも主要CTAがファーストビューに入るよう、画像より先に置きます） */}
        <div>
          <p
            className="font-accent text-[0.68rem] tracking-[0.3em] uppercase sm:text-xs"
            aria-hidden="true"
          >
            <GradientText variant="pinkPurple">{hero.eyebrow}</GradientText>
          </p>

          <h1 className="font-heading-jp mt-5 text-[2rem] leading-[1.35] tracking-[0.02em] text-balance sm:text-[2.6rem] lg:text-[3.1rem]">
            <GradientText variant="rainbow" animated>
              {hero.title}
            </GradientText>
          </h1>

          <p className="text-ink/80 mt-5 max-w-xl text-sm leading-relaxed sm:text-base">
            {hero.subtitle}
          </p>
          <p className="text-muted mt-2 max-w-xl text-sm leading-relaxed">{hero.lead}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ActionLink
              href={links.booking}
              external
              size="lg"
              pulse
              icon={<CalendarCheck className="size-5" aria-hidden="true" />}
            >
              {messages.common.book}
            </ActionLink>
            <ActionLink
              href={localeHref(locale, routes.menu.path)}
              variant="secondary"
              size="lg"
              icon={<Sparkles className="text-gold size-4" aria-hidden="true" />}
            >
              {messages.common.viewMenu}
            </ActionLink>
            {!isPlaceholder(links.instagram) ? (
              <ActionLink
                href={links.instagram}
                external
                variant="ghost"
                size="md"
                icon={<InstagramIcon className="size-4" />}
              >
                {messages.common.instagram}
              </ActionLink>
            ) : null}
          </div>

          <p className="text-muted mt-8 flex items-center gap-2 text-[0.7rem] tracking-[0.2em] uppercase">
            <ChevronDown className="anim-scroll-hint text-gold size-4" aria-hidden="true" />
            <span className="font-accent">{hero.scroll}</span>
          </p>
        </div>

        {/* ビジュアル */}
        <div className="relative">
          {/* 縦書きの英字アクセント（装飾） */}
          <span
            aria-hidden="true"
            className="font-accent text-muted absolute top-6 -left-2 hidden text-[0.6rem] tracking-[0.4em] uppercase lg:block"
            style={{ writingMode: "vertical-rl" }}
          >
            Fill-in · One-on-one · Since your nails matter
          </span>

          <div className="gradient-frame relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] lg:mr-0 lg:ml-auto">
            <AppImage
              src="/images/hero/hero-main.jpg"
              alt={hero.imageAlt}
              width={1024}
              height={1536}
              priority
              sizes="(max-width: 1024px) 90vw, 460px"
              className="h-auto w-full object-cover"
            />
            {/* 白背景へ溶け込ませる半透明グラデーション */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, rgba(255,215,106,0.12) 0%, rgba(255,255,255,0) 45%, rgba(139,61,255,0.12) 100%)",
              }}
            />
          </div>

          {/*
            以前はここに小さなロゴバッジを置いていましたが、
            キービジュアル自体にワードマークが入っているため、
            ブランド名が二重に表示されてしまうので削除しました。
          */}
        </div>
      </div>
    </section>
  );
}
