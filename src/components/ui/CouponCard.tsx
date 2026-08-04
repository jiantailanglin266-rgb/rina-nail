import { Clock, Ticket } from "lucide-react";

import { ActionLink } from "@/components/ui/ActionLink";
import { GradientText } from "@/components/ui/GradientText";
import { formatPrice, type Coupon } from "@/data/menu";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";
import { bookingLink } from "@/lib/booking";

type Props = {
  coupon: Coupon;
  locale: Locale;
  messages: Messages;
};

export function CouponCard({ coupon, locale, messages }: Props) {
  const booking = bookingLink(locale);
  const text = messages.menu.coupons.items[coupon.id as keyof Messages["menu"]["coupons"]["items"]];

  return (
    <article className="glass-card relative h-full overflow-hidden rounded-3xl border-0 [background-image:var(--gradient-signature)] p-[1.5px]">
      {/* 内側は半透明の白。背景のカラーオーブがうっすら透けます */}
      <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-white/92 p-6 backdrop-blur-xl sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full [background-image:var(--gradient-neon)] px-3 py-1 text-[0.7rem] font-medium text-white">
            <Ticket className="size-3" aria-hidden="true" />
            {coupon.firstTimeOnly
              ? messages.menu.coupons.firstTimeBadge
              : messages.menu.coupons.newCustomerBadge}
          </span>
          {coupon.hasTimeLimit ? (
            <span className="bg-soft-gold text-gold inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.7rem]">
              <Clock className="size-3" aria-hidden="true" />
              {messages.menu.coupons.timeLimitedBadge}
            </span>
          ) : null}
        </div>

        <h3 className="mt-4 text-lg leading-snug sm:text-xl">{text.name}</h3>

        <p className="mt-4 flex flex-wrap items-baseline gap-3">
          <GradientText variant="signature" className="font-display text-4xl">
            {formatPrice(coupon.price, locale)}
          </GradientText>
          {coupon.regularPrice ? (
            <span className="text-muted text-sm">
              <span className="sr-only">{messages.common.regularPrice}: </span>
              <s>{formatPrice(coupon.regularPrice, locale)}</s>
            </span>
          ) : null}
        </p>

        <p className="text-muted mt-4 text-sm leading-relaxed">{text.description}</p>
        <p className="text-deep-purple mt-2 text-sm leading-relaxed">{text.condition}</p>

        <ActionLink href={booking.href} external={booking.external} size="sm" className="mt-6">
          {messages.common.book}
        </ActionLink>
      </div>
    </article>
  );
}
