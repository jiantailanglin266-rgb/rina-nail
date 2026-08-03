import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertCircle, Check } from "lucide-react";

import { Reveal } from "@/components/animations/Reveal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/sections/CTASection";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { ActionLink } from "@/components/ui/ActionLink";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { localeHref, routes } from "@/data/navigation";
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
  return pageMetadata({ locale, messages, routeKey: "fillIn" });
}

export default async function FillInPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);
  const fillIn = messages.fillIn;
  const { crumbs, jsonLd } = buildBreadcrumbs(locale, messages, "fillIn");
  // フィルイン関連の質問だけを抜き出します（FAQPage 構造化データはFAQページ側に集約）
  const relatedFaq = messages.faq.groups[0].items.slice(0, 3);

  return (
    <>
      <Breadcrumbs items={crumbs} label={messages.common.breadcrumbLabel} />
      <PageHeader
        eyebrow="WHAT IS FILL-IN"
        title={fillIn.title}
        lead={fillIn.lead}
        summary={fillIn.summary}
        summaryLabel={messages.common.summaryLabel}
      />

      {/* フィルインとは */}
      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl sm:text-2xl">{fillIn.whatIs.heading}</h2>
          <div className="text-muted mt-6 space-y-4 text-sm leading-relaxed sm:text-base">
            {fillIn.whatIs.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Section>

      {/* 通常オフとの違い */}
      <Section tone="lilac">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl sm:text-2xl">{fillIn.difference.heading}</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse overflow-hidden rounded-2xl bg-white text-sm">
              <caption className="sr-only">{fillIn.difference.caption}</caption>
              <thead>
                <tr className="[background-image:var(--gradient-signature)] text-white">
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    {fillIn.difference.head.item}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    {fillIn.difference.head.fillIn}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    {fillIn.difference.head.normalOff}
                  </th>
                </tr>
              </thead>
              <tbody>
                {fillIn.difference.rows.map((row) => (
                  <tr key={row.item} className="border-line border-b last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-medium">
                      {row.item}
                    </th>
                    <td className="text-deep-purple px-4 py-3">{row.fillIn}</td>
                    <td className="text-muted px-4 py-3">{row.normalOff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* メリット */}
      <Section tone="white" decorated>
        <SectionHeading eyebrow="MERIT" heading={fillIn.merits.heading} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fillIn.merits.items.map((item, index) => (
            <Reveal as="li" key={item.title} delay={index * 0.07} className="h-full">
              <ServiceCard title={item.title} body={item.body} />
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* 向いている方 */}
      <Section tone="pink">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl sm:text-2xl">{fillIn.suitable.heading}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {fillIn.suitable.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-white px-5 py-4 text-sm leading-relaxed"
              >
                <Check className="text-neon-pink mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 注意点 */}
      <Section tone="white">
        <div className="mx-auto max-w-3xl">
          <h2 className="flex items-center gap-2 text-xl sm:text-2xl">
            <AlertCircle className="text-gold size-5" aria-hidden="true" />
            {fillIn.notes.heading}
          </h2>
          <ul className="mt-6 space-y-3">
            {fillIn.notes.items.map((item) => (
              <li
                key={item}
                className="bg-soft-gold/50 rounded-2xl px-5 py-4 text-sm leading-relaxed"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* よくある質問 */}
      <Section tone="lilac">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl sm:text-2xl">{messages.faq.title}</h2>
          <div className="mt-6">
            <FAQAccordion items={relatedFaq} />
          </div>
          <div className="mt-8">
            <ActionLink href={localeHref(locale, routes.faq.path)} variant="ghost">
              {messages.home.faq.cta}
            </ActionLink>
          </div>
        </div>
      </Section>

      <CTASection
        locale={locale}
        messages={messages}
        heading={fillIn.cta.heading}
        lead={fillIn.cta.lead}
        note={messages.home.cta.note}
      />

      <JsonLd
        data={[
          webPageJsonLd({ locale, messages, routeKey: "fillIn", summary: fillIn.summary }),
          jsonLd,
        ]}
      />
    </>
  );
}
