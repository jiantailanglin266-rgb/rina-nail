import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

import { BusinessHours } from "@/components/sections/BusinessHours";
import { PaymentMethods } from "@/components/sections/PaymentMethods";
import { ActionLink } from "@/components/ui/ActionLink";
import { GradientText } from "@/components/ui/GradientText";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { localeHref, mainNavKeys, routes, utilityNavKeys } from "@/data/navigation";
import { hasSocialAccounts } from "@/data/social";
import { links, siteName, store, telHref } from "@/data/site";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";

type Props = {
  locale: Locale;
  messages: Messages;
};

export function Footer({ locale, messages }: Props) {
  const tel = telHref(links.phone);

  return (
    /* マーキーが本文との間を仕切るため、以前ほど大きな余白は取りません */
    <footer className="border-line bg-soft-pink/50 relative mt-12 border-t sm:mt-16">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.1fr_1fr_1fr] lg:gap-16">
        {/* ブランド */}
        <div>
          <Link
            href={localeHref(locale, routes.home.path)}
            className="inline-flex flex-col leading-none"
          >
            <GradientText variant="signature" className="font-display text-3xl tracking-wide">
              {siteName}
            </GradientText>
            <span className="font-accent text-muted mt-1 text-[0.55rem] tracking-[0.28em] uppercase">
              Private Nail Salon · Yokkaichi
            </span>
          </Link>

          <p className="text-muted mt-5 max-w-sm text-sm leading-relaxed">
            {messages.footer.tagline}
          </p>

          <address className="mt-6 space-y-2 text-sm not-italic">
            <p className="flex items-start gap-2">
              <MapPin className="text-gold mt-1 size-4 shrink-0" aria-hidden="true" />
              <span>{store.address.full}</span>
            </p>
            {tel ? (
              <p className="flex items-center gap-2">
                <Phone className="text-gold size-4 shrink-0" aria-hidden="true" />
                <a href={tel} className="hover:text-purple transition">
                  {links.phone}
                </a>
              </p>
            ) : null}
          </address>

          {hasSocialAccounts() ? (
            <div className="mt-7">
              <h2 className="font-accent text-muted text-[0.7rem] tracking-[0.28em] uppercase">
                {messages.common.social.heading}
              </h2>
              <SocialLinks messages={messages} uid="footer-" size="md" className="mt-4" />
            </div>
          ) : null}
        </div>

        {/* サイトマップ */}
        <nav aria-label={messages.footer.navHeading}>
          <h2 className="font-accent text-muted text-[0.7rem] tracking-[0.28em] uppercase">
            {messages.footer.navHeading}
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link
                href={localeHref(locale, routes.home.path)}
                className="hover:text-purple transition"
              >
                {messages.nav.home}
              </Link>
            </li>
            {mainNavKeys.map((key) => (
              <li key={key}>
                <Link
                  href={localeHref(locale, routes[key].path)}
                  className="hover:text-purple transition"
                >
                  {messages.nav[key]}
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="font-accent text-muted mt-8 text-[0.7rem] tracking-[0.28em] uppercase">
            {messages.footer.legalHeading}
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {utilityNavKeys.map((key) => (
              <li key={key}>
                <Link
                  href={localeHref(locale, routes[key].path)}
                  className="hover:text-purple transition"
                >
                  {messages.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 店舗情報 */}
        <div>
          <h2 className="font-accent text-muted text-[0.7rem] tracking-[0.28em] uppercase">
            {messages.footer.infoHeading}
          </h2>
          <BusinessHours messages={messages} className="mt-5" />
          <p className="text-muted mt-3 text-xs">{messages.access.closed}</p>

          <h2 className="font-accent text-muted mt-8 text-[0.7rem] tracking-[0.28em] uppercase">
            {messages.about.payment.heading}
          </h2>
          <PaymentMethods className="mt-4" label={messages.about.payment.heading} />

          <h2 className="font-accent text-muted mt-8 text-[0.7rem] tracking-[0.28em] uppercase">
            {messages.footer.bookingHeading}
          </h2>
          <p className="text-muted mt-3 text-xs">{messages.footer.bookingNote}</p>
          <ActionLink href={links.booking} external size="sm" className="mt-4">
            {messages.common.book}
          </ActionLink>
        </div>
      </div>

      <div className="border-line border-t">
        {/* モバイルの固定予約バーに隠れないよう、最下部だけ余白を足します */}
        <div className="container-page text-muted flex flex-col items-center justify-between gap-2 py-6 pb-28 text-xs sm:flex-row lg:pb-6">
          <p>
            © {new Date().getFullYear()} {messages.footer.copyright}
          </p>
          <p lang="ja">
            {store.name}（{store.nameKana}）
          </p>
        </div>
      </div>
    </footer>
  );
}
