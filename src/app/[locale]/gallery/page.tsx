import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/sections/CTASection";
import { GalleryFilter } from "@/components/sections/GalleryFilter";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { galleryItems } from "@/data/gallery";
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
  return pageMetadata({ locale, messages, routeKey: "gallery" });
}

export default async function GalleryPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);
  const { crumbs, jsonLd } = buildBreadcrumbs(locale, messages, "gallery");

  return (
    <>
      <Breadcrumbs items={crumbs} label={messages.common.breadcrumbLabel} />
      <PageHeader
        eyebrow="DESIGN GALLERY"
        title={messages.gallery.title}
        lead={messages.gallery.lead}
        summary={messages.gallery.summary}
        summaryLabel={messages.common.summaryLabel}
      />

      <Section preset="gallery" intensity="high" salvia={{ variant: "gallery", density: "medium" }}>
        <GalleryFilter
          items={galleryItems}
          labels={{
            filterLabel: messages.gallery.filterLabel,
            all: messages.gallery.all,
            categories: messages.gallery.categories,
            altTemplate: messages.gallery.altTemplate,
          }}
        />
        <p className="text-muted mt-8 text-xs">{messages.gallery.note}</p>
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
          webPageJsonLd({
            locale,
            messages,
            routeKey: "gallery",
            summary: messages.gallery.summary,
          }),
          jsonLd,
        ]}
      />
    </>
  );
}
