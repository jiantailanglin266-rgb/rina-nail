import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  CarFront,
  CreditCard,
  Gem,
  Heart,
  Layers,
  MapPin,
  User,
  UserRound,
} from "lucide-react";

import { Marquee } from "@/components/animations/Marquee";
import { GradientMesh } from "@/components/backgrounds/GradientMesh";
import { Reveal } from "@/components/animations/Reveal";
import { Section } from "@/components/layout/Section";
import { AccessMap } from "@/components/sections/AccessMap";
import { BusinessHours } from "@/components/sections/BusinessHours";
import { CTASection } from "@/components/sections/CTASection";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { FlowSteps } from "@/components/sections/FlowSteps";
import { GalleryGrid } from "@/components/sections/GalleryGrid";
import { Hero } from "@/components/sections/Hero";
import { OwnerProfile } from "@/components/sections/OwnerProfile";
import { PaymentMethods } from "@/components/sections/PaymentMethods";
import { ActionLink } from "@/components/ui/ActionLink";
import { CouponCard } from "@/components/ui/CouponCard";
import { JsonLd } from "@/components/ui/JsonLd";
import { MenuCard } from "@/components/ui/MenuCard";
import { PageSummary } from "@/components/ui/PageSummary";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { galleryItems, homeGalleryCount } from "@/data/gallery";
import { coupons, menuItems } from "@/data/menu";
import { localeHref, routes } from "@/data/navigation";
import { store } from "@/data/site";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionary";
import type { LocalePageProps } from "@/lib/route-params";
import { pageMetadata } from "@/lib/seo";
import { faqJsonLd, webPageJsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata({ locale, messages, routeKey: "home" });
}

/** 特徴カードのアイコン（順序は翻訳ファイルの home.features.items と対応） */
const FEATURE_ICONS = [
  <User key="0" className="size-5" aria-hidden="true" />,
  <Layers key="1" className="size-5" aria-hidden="true" />,
  <Gem key="2" className="size-5" aria-hidden="true" />,
  <Heart key="3" className="size-5" aria-hidden="true" />,
  <CarFront key="4" className="size-5" aria-hidden="true" />,
  <UserRound key="5" className="size-5" aria-hidden="true" />,
  <CreditCard key="6" className="size-5" aria-hidden="true" />,
  <CalendarClock key="7" className="size-5" aria-hidden="true" />,
];

export default async function HomePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);
  const home = messages.home;
  const featuredMenu = menuItems.filter((item) => item.category !== "care").slice(0, 3);
  const featuredGallery = galleryItems.slice(0, homeGalleryCount);
  const featuredFaq = messages.faq.groups[0].items.slice(0, 5);

  return (
    <>
      <Hero locale={locale} messages={messages} />

      {/* マーキー（装飾。同じ情報は本文にも記載しています） */}
      <div className="border-line/70 relative isolate overflow-hidden border-y bg-white py-5 sm:py-7">
        <GradientMesh opacity={0.42} className="-z-10" />
        <div className="relative z-10">
          <Marquee items={home.marquee.lineOne} direction="left" />
          <Marquee items={home.marquee.lineTwo} direction="right" className="mt-3 sm:mt-4" />
        </div>
      </div>

      {/* ページ要約（生成AI・検索エンジン向け） */}
      <div className="container-page pt-14 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <PageSummary label={messages.common.summaryLabel}>{home.summary}</PageSummary>
        </div>
      </div>

      {/* コンセプト */}
      <Section
        preset="concept"
        salvia={{ variant: "section", density: "medium" }}
        aria-labelledby="concept-heading"
      >
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal direction="left">
            <SectionHeading
              id="concept-heading"
              eyebrow={home.concept.eyebrow}
              heading={home.concept.heading}
              lead={home.concept.lead}
              align="left"
            />
            <div className="text-muted mt-6 space-y-4 text-sm leading-relaxed sm:text-base">
              {home.concept.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal direction="right">
            <div className="gradient-frame overflow-hidden rounded-[2rem]">
              <Image
                src="/images/salon/salon-01.jpg"
                alt={home.concept.heading}
                width={1400}
                height={933}
                loading="lazy"
                sizes="(max-width: 1024px) 92vw, 560px"
                className="h-auto w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* サロンの特徴 */}
      <Section preset="concept" sparkles aria-labelledby="features-heading">
        <SectionHeading
          id="features-heading"
          eyebrow={home.features.eyebrow}
          heading={home.features.heading}
          lead={home.features.lead}
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {home.features.items.map((item, index) => (
            <Reveal as="li" key={item.title} delay={Math.min(index, 4) * 0.06} className="h-full">
              <ServiceCard title={item.title} body={item.body} icon={FEATURE_ICONS[index]} />
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* フィルイン */}
      <Section preset="fillIn" aria-labelledby="fillin-heading">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal direction="left">
            <SectionHeading
              id="fillin-heading"
              eyebrow={home.fillIn.eyebrow}
              heading={home.fillIn.heading}
              lead={home.fillIn.lead}
              align="left"
              gradient="purpleGold"
            />
          </Reveal>
          <Reveal direction="right">
            <div className="gradient-frame bg-soft-gold/50 rounded-3xl p-7 sm:p-9">
              <p className="text-sm leading-relaxed sm:text-base">{home.fillIn.body}</p>
              <ActionLink
                href={localeHref(locale, routes.fillIn.path)}
                variant="secondary"
                className="mt-6"
              >
                {home.fillIn.cta}
              </ActionLink>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* メニュー */}
      <Section
        preset="menu"
        salvia={{ variant: "section", density: "low", showFlowers: false, showBranches: false }}
        aria-labelledby="menu-heading"
      >
        <SectionHeading
          id="menu-heading"
          eyebrow={home.menu.eyebrow}
          heading={home.menu.heading}
          lead={home.menu.lead}
        />
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {featuredMenu.map((item, index) => (
            <Reveal as="li" key={item.id} delay={index * 0.08} className="h-full">
              <MenuCard item={item} locale={locale} messages={messages} />
            </Reveal>
          ))}
        </ul>
        <p className="text-muted mt-6 text-center text-xs">{messages.common.taxIncluded}</p>
        <div className="mt-8 flex justify-center">
          <ActionLink href={localeHref(locale, routes.menu.path)} variant="secondary" size="lg">
            {home.menu.cta}
          </ActionLink>
        </div>
      </Section>

      {/* クーポン */}
      <Section preset="coupon" intensity="high" sparkles aria-labelledby="coupon-heading">
        <SectionHeading
          id="coupon-heading"
          eyebrow={home.coupons.eyebrow}
          heading={home.coupons.heading}
          lead={home.coupons.lead}
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

      {/* ギャラリー */}
      <Section
        preset="gallery"
        intensity="high"
        salvia={{ variant: "gallery", density: "medium" }}
        aria-labelledby="gallery-heading"
      >
        <SectionHeading
          id="gallery-heading"
          eyebrow={home.gallery.eyebrow}
          heading={home.gallery.heading}
          lead={home.gallery.lead}
        />
        <GalleryGrid items={featuredGallery} messages={messages} className="mt-12" />
        <div className="mt-10 flex justify-center">
          <ActionLink href={localeHref(locale, routes.gallery.path)} variant="secondary" size="lg">
            {home.gallery.cta}
          </ActionLink>
        </div>
      </Section>

      {/* オーナー紹介 */}
      <Section
        preset="owner"
        salvia={{ variant: "owner", density: "medium" }}
        aria-labelledby="owner-heading"
      >
        <SectionHeading
          id="owner-heading"
          eyebrow={home.owner.eyebrow}
          heading={home.owner.heading}
          align="left"
        />
        <OwnerProfile messages={messages} className="mt-10" />
        <div className="mt-10">
          <ActionLink href={localeHref(locale, routes.about.path)} variant="ghost">
            {home.owner.cta}
          </ActionLink>
        </div>
      </Section>

      {/* 初めての方へ・施術の流れ */}
      <Section preset="flow" aria-labelledby="flow-heading">
        <SectionHeading
          id="flow-heading"
          eyebrow={home.firstVisit.eyebrow}
          heading={home.firstVisit.heading}
          lead={home.firstVisit.lead}
        />
        <h3 className="font-accent text-muted mt-12 text-center text-[0.7rem] tracking-[0.28em] uppercase">
          {home.flow.heading}
        </h3>
        <FlowSteps steps={home.flow.steps} />
        <div className="mt-10 flex justify-center">
          <ActionLink
            href={localeHref(locale, routes.firstVisit.path)}
            variant="secondary"
            size="lg"
          >
            {home.firstVisit.cta}
          </ActionLink>
        </div>
      </Section>

      {/* FAQ */}
      <Section
        preset="faq"
        salvia={{ variant: "section", density: "low", showFlowers: false, showBranches: false }}
        aria-labelledby="faq-heading"
      >
        <SectionHeading
          id="faq-heading"
          eyebrow={home.faq.eyebrow}
          heading={home.faq.heading}
          lead={home.faq.lead}
        />
        <div className="mx-auto mt-12 max-w-3xl">
          <FAQAccordion items={featuredFaq} />
          <div className="mt-8 flex justify-center">
            <ActionLink href={localeHref(locale, routes.faq.path)} variant="ghost">
              {home.faq.cta}
            </ActionLink>
          </div>
        </div>
      </Section>

      {/* アクセス・営業情報 */}
      <Section
        preset="access"
        salvia={{ variant: "section", density: "low", showFlowers: false, showBranches: false }}
        aria-labelledby="access-heading"
      >
        <SectionHeading
          id="access-heading"
          eyebrow={home.access.eyebrow}
          heading={home.access.heading}
          lead={home.access.lead}
          align="left"
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <AccessMap messages={messages} />

          <div className="space-y-8">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="text-gold size-4" aria-hidden="true" />
                {messages.access.addressHeading}
              </h3>
              <address className="mt-2 text-sm not-italic">{store.address.full}</address>
              <p className="text-muted mt-2 text-xs">{messages.access.parking}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium">{messages.access.hoursHeading}</h3>
              <BusinessHours messages={messages} className="mt-3" />
              <p className="text-muted mt-3 text-xs">{messages.access.hoursNote}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium">{messages.about.payment.heading}</h3>
              <PaymentMethods className="mt-3" label={messages.about.payment.heading} />
            </div>

            <ActionLink href={localeHref(locale, routes.access.path)} variant="secondary">
              {home.access.cta}
            </ActionLink>
          </div>
        </div>
      </Section>

      {/* 予約CTA */}
      <CTASection
        locale={locale}
        messages={messages}
        heading={home.cta.heading}
        lead={home.cta.lead}
        note={home.cta.note}
      />

      <JsonLd
        data={[
          webPageJsonLd({ locale, messages, routeKey: "home", summary: home.summary }),
          faqJsonLd(messages),
        ]}
      />
    </>
  );
}
