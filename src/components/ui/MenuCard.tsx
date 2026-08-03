import { Check } from "lucide-react";

import { GradientText } from "@/components/ui/GradientText";
import { formatPrice, type MenuItem } from "@/data/menu";
import type { Locale } from "@/i18n/config";
import { interpolate } from "@/i18n/dictionary";
import type { Messages } from "@/i18n/dictionary";

type Props = {
  item: MenuItem;
  locale: Locale;
  messages: Messages;
};

/**
 * メニュー1件のカード。
 *
 * 金額が未確定のメニューは、架空の価格を出さずに
 * プレースホルダー（{{PRICE_...}}）と注記を表示します。
 */
export function MenuCard({ item, locale, messages }: Props) {
  const text = messages.menu.items[item.id as keyof Messages["menu"]["items"]];
  const hasPrice = item.price !== null;
  const priceLabel = hasPrice
    ? item.from
      ? interpolate(messages.common.priceFrom, { price: formatPrice(item.price!, locale) })
      : formatPrice(item.price!, locale)
    : item.pricePlaceholder;

  return (
    <article className="gradient-frame glass-card flex h-full flex-col rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg leading-snug">{text.name}</h3>
        <p className="shrink-0 text-right">
          {hasPrice ? (
            <GradientText variant="pinkPurple" className="font-display text-2xl whitespace-nowrap">
              {priceLabel}
            </GradientText>
          ) : (
            <span className="font-accent text-muted text-xs">{priceLabel}</span>
          )}
        </p>
      </div>

      {!hasPrice ? (
        <p className="text-muted mt-1 text-right text-[0.7rem]">{messages.common.priceTbd}</p>
      ) : null}

      <p className="text-muted mt-4 flex-1 text-sm leading-relaxed">{text.description}</p>

      {item.fillIn || item.offIncluded ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {item.fillIn ? (
            <li className="bg-soft-lilac text-deep-purple inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.7rem]">
              <Check className="size-3" aria-hidden="true" />
              {messages.nav.fillIn}
            </li>
          ) : null}
          {item.offIncluded ? (
            <li className="bg-soft-pink text-neon-pink inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.7rem]">
              <Check className="size-3" aria-hidden="true" />
              {messages.menu.items.off.name}
            </li>
          ) : null}
        </ul>
      ) : null}
    </article>
  );
}
