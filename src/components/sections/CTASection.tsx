import { CalendarCheck, MessageCircleHeart, Sparkles } from "lucide-react";

import { AnimatedGoldBackground } from "@/components/animations/AnimatedGoldBackground";
import { SalviaFlowerRain } from "@/components/animations/salvia/SalviaFlowerRain";
import { ColorfulGradientBackground } from "@/components/backgrounds/ColorfulGradientBackground";
import { ActionLink } from "@/components/ui/ActionLink";
import { GradientText } from "@/components/ui/GradientText";
import { localeHref, routes } from "@/data/navigation";
import { links } from "@/data/site";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";

type Props = {
  locale: Locale;
  messages: Messages;
  heading: string;
  lead: string;
  note?: string;
};

/** ページ下部の予約CTA。全ページ共通で使用します。 */
export function CTASection({ locale, messages, heading, lead, note }: Props) {
  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20">
      {/* サイト内で最も華やかなグラデーション */}
      <ColorfulGradientBackground preset="cta" intensity="high" className="-z-30" />
      <AnimatedGoldBackground density="soft" className="-z-20" />
      {/* CTAの外周を囲むように配置。ボタンの上には重ねません */}
      <SalviaFlowerRain variant="cta" density="medium" colorMode="mixed" className="-z-10" />

      <div className="container-page relative z-10 flex flex-col items-center text-center">
        <h2 className="max-w-2xl text-2xl leading-snug text-balance sm:text-3xl">
          <GradientText variant="rainbow" animated>
            {heading}
          </GradientText>
        </h2>
        <p className="text-muted mt-4 max-w-xl text-sm leading-relaxed sm:text-base">{lead}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
            {messages.common.chooseFromMenu}
          </ActionLink>
          <ActionLink
            href={localeHref(locale, routes.gallery.path)}
            variant="ghost"
            icon={<MessageCircleHeart className="size-4" aria-hidden="true" />}
          >
            {messages.common.consultDesign}
          </ActionLink>
        </div>

        {note ? <p className="text-muted mt-6 max-w-xl text-xs">{note}</p> : null}
      </div>
    </section>
  );
}
