import Link from "next/link";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ActionLink } from "@/components/ui/ActionLink";
import { GradientText } from "@/components/ui/GradientText";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { socialAccounts } from "@/data/social";
import { siteName } from "@/data/site";
import { localeHref, mainNavKeys, routes } from "@/data/navigation";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";
import { bookingLink } from "@/lib/booking";

type Props = {
  locale: Locale;
  messages: Messages;
};

/**
 * 固定ヘッダー。
 * 中身は静的なため、開閉が必要な部分（モバイルメニュー・言語切り替え）だけを
 * クライアントコンポーネントに分離しています。
 */
export function Header({ locale, messages }: Props) {
  const navItems = mainNavKeys.map((key) => ({
    href: localeHref(locale, routes[key].path),
    label: messages.nav[key],
  }));

  // 未設定なら、モバイルメニュー側の見出しごと出しません
  const hasSocial = socialAccounts().length > 0;
  const booking = bookingLink(locale);

  return (
    <header className="border-line/70 fixed inset-x-0 top-0 z-50 border-b bg-white/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href={localeHref(locale, routes.home.path)}
          className="flex shrink-0 flex-col leading-none"
          aria-label={`${siteName} — ${messages.nav.home}`}
        >
          <GradientText variant="signature" className="font-display text-2xl tracking-wide">
            {siteName}
          </GradientText>
          <span className="font-accent text-muted mt-0.5 text-[0.55rem] tracking-[0.28em] uppercase">
            Yokkaichi · Private Nail
          </span>
        </Link>

        <nav aria-label={messages.common.menuLabel} className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  // 折り返すとヘッダーの高さ（h-16）を超えてしまうため、改行させません
                  className="text-ink hover:text-purple text-[0.8rem] font-medium tracking-wide whitespace-nowrap transition"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 右側の操作群。ナビゲーションに押し潰されないよう shrink-0 で固定幅を保ちます */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* SNSアイコン。ヘッダーは横幅が限られるため、主要3件だけを小さめに置きます
              （全件はフッターとモバイルメニューに表示）。
              狭い画面ではナビゲーションが折り返すため非表示にします */}
          <SocialLinks
            messages={messages}
            uid="header-"
            size="xs"
            maxItems={3}
            className="flex-nowrap gap-1.5 max-xl:hidden"
          />

          <LanguageSwitcher
            currentLocale={locale}
            label={messages.common.languageLabel}
            currentLabel={messages.common.currentLanguage}
            className="hidden sm:block"
          />
          {/* ActionLink 側が inline-flex を持つため、打ち消しには max-md:hidden を使います */}
          <ActionLink href={booking.href} external={booking.external} size="sm" className="max-md:hidden">
            {messages.common.bookShort}
          </ActionLink>
          <MobileMenu
            items={navItems}
            openLabel={messages.common.openMenu}
            closeLabel={messages.common.closeMenu}
            menuLabel={messages.common.menuLabel}
            bookingHref={booking.href}
            bookingExternal={booking.external}
            bookingLabel={messages.common.book}
            socialHeading={hasSocial ? messages.common.social.heading : undefined}
            social={
              hasSocial ? (
                <SocialLinks messages={messages} uid="menu-" size="md" showNames />
              ) : null
            }
          />
        </div>
      </div>
    </header>
  );
}
