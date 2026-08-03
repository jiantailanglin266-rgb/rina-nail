import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { Reveal } from "@/components/animations/Reveal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/sections/CTASection";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CouponCard } from "@/components/ui/CouponCard";
import { JsonLd } from "@/components/ui/JsonLd";
import { MenuCard } from "@/components/ui/MenuCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { coupons, menuItems, type MenuCategory } from "@/data/menu";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionary";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";
import type { LocalePageProps } from "@/lib/route-params";
import { pageMetadata } from "@/lib/seo";
import { webPageJsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata({ locale, messages, routeKey: "menu" });
}

const CATEGORY_ORDER: MenuCategory[] = ["base", "art", "option", "care"];

export default async function MenuPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);
  const { crumbs, jsonLd } = buildBreadcrumbs(locale, messages, "menu");

  return (
    <>
      <Breadcrumbs items={crumbs} label={messages.common.breadcrumbLabel} />
      <PageHeader
        eyebrow="MENU & PRICE"
        title={messages.menu.title}
        lead={messages.menu.lead}
        summary={messages.menu.summary}
        summaryLabel={messages.common.summaryLabel}
      />

      {/* メニュー一覧 */}
      <Section tone="white">
        <div className="space-y-14">
          {CATEGORY_ORDER.map((category) => {
            const items = menuItems.filter((item) => item.category === category);
            if (items.length === 0) return null;

            return (
              <div key={category}>
                <h2 className="border-line border-b pb-3 text-lg sm:text-xl">
                  {messages.menu.categories[category]}
                </h2>
                <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item, index) => (
                    <Reveal as="li" key={item.id} delay={index * 0.06} className="h-full">
                      <MenuCard item={item} locale={locale} messages={messages} />
                    </Reveal>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Section>

      {/* クーポン */}
      <Section tone="pink" decorated id="coupons">
        <SectionHeading
          eyebrow="COUPON"
          heading={messages.menu.coupons.heading}
          lead={messages.menu.coupons.lead}
          gradient="neon"
        />
        <ul className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          {coupons.map((coupon, index) => (
            <Reveal as="li" key={coupon.id} delay={index * 0.1} className="h-full">
              <CouponCard coupon={coupon} locale={locale} messages={messages} />
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* 注意事項 */}
      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <h2 className="flex items-center gap-2 text-lg">
            <AlertCircle className="text-gold size-5" aria-hidden="true" />
            {messages.menu.notes.heading}
          </h2>
          <ul className="mt-6 space-y-3">
            {messages.menu.notes.items.map((note) => (
              <li
                key={note}
                className="bg-soft-gold/50 flex gap-3 rounded-2xl px-5 py-4 text-sm leading-relaxed"
              >
                <span aria-hidden="true" className="text-gold">
                  ・
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CTASection
        locale={locale}
        messages={messages}
        heading={messages.home.cta.heading}
        lead={messages.home.cta.lead}
        note={messages.home.cta.note}
      />

      <JsonLd
        data={[
          webPageJsonLd({ locale, messages, routeKey: "menu", summary: messages.menu.summary }),
          jsonLd,
        ]}
      />
    </>
  );
}
