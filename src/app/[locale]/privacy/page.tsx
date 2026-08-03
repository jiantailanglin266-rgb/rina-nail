import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Section } from "@/components/layout/Section";
import { LegalSections } from "@/components/sections/LegalSections";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
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
  return pageMetadata({ locale, messages, routeKey: "privacy" });
}

export default async function PrivacyPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);
  const { crumbs, jsonLd } = buildBreadcrumbs(locale, messages, "privacy");

  return (
    <>
      <Breadcrumbs items={crumbs} label={messages.common.breadcrumbLabel} />

      <header className="container-page pb-8">
        <h1 className="text-3xl sm:text-4xl">{messages.privacy.title}</h1>
        <p className="text-muted mt-4 max-w-3xl text-sm leading-relaxed">{messages.privacy.lead}</p>
      </header>

      <Section preset="plain">
        <LegalSections sections={messages.privacy.sections} />
      </Section>

      <JsonLd data={[webPageJsonLd({ locale, messages, routeKey: "privacy" }), jsonLd]} />
    </>
  );
}
