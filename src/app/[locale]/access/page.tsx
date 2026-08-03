import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarFront, MapPin, Navigation } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { AccessMap } from "@/components/sections/AccessMap";
import { BusinessHours } from "@/components/sections/BusinessHours";
import { CTASection } from "@/components/sections/CTASection";
import { ActionLink } from "@/components/ui/ActionLink";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { links, store, telHref } from "@/data/site";
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
  return pageMetadata({ locale, messages, routeKey: "access" });
}

export default async function AccessPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);
  const page = messages.access;
  const { crumbs, jsonLd } = buildBreadcrumbs(locale, messages, "access");
  const tel = telHref(links.phone);

  return (
    <>
      <Breadcrumbs items={crumbs} label={messages.common.breadcrumbLabel} />
      <PageHeader
        eyebrow="ACCESS & HOURS"
        title={page.title}
        lead={page.lead}
        summary={page.summary}
        summaryLabel={messages.common.summaryLabel}
      />

      <Section preset="access">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="space-y-10">
            <AccessMap messages={messages} />

            <div>
              <h2 className="flex items-center gap-2 text-lg">
                <Navigation className="text-gold size-5" aria-hidden="true" />
                {page.directionsHeading}
              </h2>
              {/* 順序のある道案内のため ol を使用します */}
              <ol className="mt-5 space-y-3">
                {page.directions.map((step, index) => (
                  <li
                    key={step}
                    className="bg-soft-pink/60 flex gap-4 rounded-2xl px-5 py-4 text-sm leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      className="font-display text-gold text-lg leading-none"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="text-muted mt-4 text-xs">{page.directionsNote}</p>
            </div>

            <div>
              <h2 className="flex items-center gap-2 text-lg">
                <CarFront className="text-gold size-5" aria-hidden="true" />
                {page.parkingHeading}
              </h2>
              <p className="text-muted mt-4 text-sm leading-relaxed">{page.parking}</p>
            </div>
          </div>

          <div className="space-y-10">
            <div className="gradient-frame rounded-2xl bg-white p-6">
              <h2 className="flex items-center gap-2 text-lg">
                <MapPin className="text-gold size-5" aria-hidden="true" />
                {page.addressHeading}
              </h2>
              <address className="mt-4 text-sm not-italic">
                <span lang="ja">{store.address.full}</span>
                {locale !== "ja" ? (
                  <span className="text-muted mt-1 block" lang="en">
                    {store.address.fullEn}
                  </span>
                ) : null}
              </address>
            </div>

            <div className="gradient-frame rounded-2xl bg-white p-6">
              <h2 className="text-lg">{page.hoursHeading}</h2>
              <BusinessHours messages={messages} className="mt-4" showCaption />
              <p className="mt-4 text-sm">
                <span className="font-medium">{page.closedHeading}：</span>
                {page.closed}
              </p>
              <p className="text-muted mt-3 text-xs">{page.hoursNote}</p>
            </div>

            <div className="gradient-frame rounded-2xl bg-white p-6">
              <h2 className="text-lg">{page.contactHeading}</h2>
              <p className="text-muted mt-4 text-sm leading-relaxed">{page.contactNote}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ActionLink href={links.booking} external>
                  {messages.common.book}
                </ActionLink>
                {tel ? (
                  <ActionLink href={tel} variant="secondary">
                    {messages.common.phone}
                  </ActionLink>
                ) : null}
              </div>
            </div>
          </div>
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
          webPageJsonLd({ locale, messages, routeKey: "access", summary: page.summary }),
          jsonLd,
        ]}
      />
    </>
  );
}
