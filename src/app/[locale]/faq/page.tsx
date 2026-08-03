import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/sections/CTASection";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionary";
import { buildBreadcrumbs } from "@/lib/breadcrumbs";
import type { LocalePageProps } from "@/lib/route-params";
import { pageMetadata } from "@/lib/seo";
import { faqJsonLd, webPageJsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata({ locale, messages, routeKey: "faq" });
}

export default async function FaqPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);
  const { crumbs, jsonLd } = buildBreadcrumbs(locale, messages, "faq");

  return (
    <>
      <Breadcrumbs items={crumbs} label={messages.common.breadcrumbLabel} />
      <PageHeader
        eyebrow="FAQ"
        title={messages.faq.title}
        lead={messages.faq.lead}
        summary={messages.faq.summary}
        summaryLabel={messages.common.summaryLabel}
      />

      <Section preset="faq">
        <div className="mx-auto max-w-3xl space-y-12">
          {messages.faq.groups.map((group) => (
            <div key={group.heading}>
              <h2 className="text-lg sm:text-xl">{group.heading}</h2>
              <div className="mt-5">
                <FAQAccordion items={group.items} />
              </div>
            </div>
          ))}
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
          webPageJsonLd({ locale, messages, routeKey: "faq", summary: messages.faq.summary }),
          faqJsonLd(messages),
          jsonLd,
        ]}
      />
    </>
  );
}
