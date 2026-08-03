import Link from "next/link";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ActionLink } from "@/components/ui/ActionLink";
import { GradientText } from "@/components/ui/GradientText";
import { links, siteName } from "@/data/site";
import { localeHref, mainNavKeys, routes } from "@/data/navigation";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";

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
                  className="text-ink hover:text-purple text-[0.8rem] font-medium tracking-wide transition"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher
            currentLocale={locale}
            label={messages.common.languageLabel}
            currentLabel={messages.common.currentLanguage}
            className="hidden sm:block"
          />
          {/* ActionLink 側が inline-flex を持つため、打ち消しには max-md:hidden を使います */}
          <ActionLink href={links.booking} external size="sm" className="max-md:hidden">
            {messages.common.bookShort}
          </ActionLink>
          <MobileMenu
            items={navItems}
            openLabel={messages.common.openMenu}
            closeLabel={messages.common.closeMenu}
            menuLabel={messages.common.menuLabel}
            bookingHref={links.booking}
            bookingLabel={messages.common.book}
          />
        </div>
      </div>
    </header>
  );
}
