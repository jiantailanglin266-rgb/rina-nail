import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarCheck, ClipboardList, Clock, CreditCard, MapPin, XCircle } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { CTASection } from "@/components/sections/CTASection";
import { FlowSteps } from "@/components/sections/FlowSteps";
import { PaymentMethods } from "@/components/sections/PaymentMethods";
import { ActionLink } from "@/components/ui/ActionLink";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { localeHref, routes } from "@/data/navigation";
import { links } from "@/data/site";
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
  return pageMetadata({ locale, messages, routeKey: "firstVisit" });
}

export default async function FirstVisitPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);
  const page = messages.firstVisit;
  const { crumbs, jsonLd } = buildBreadcrumbs(locale, messages, "firstVisit");

  return (
    <>
      <Breadcrumbs items={crumbs} label={messages.common.breadcrumbLabel} />
      <PageHeader
        eyebrow="FOR FIRST-TIME GUESTS"
        title={page.title}
        lead={page.lead}
        summary={page.summary}
        summaryLabel={messages.common.summaryLabel}
      />

      {/* 予約方法 */}
      <Section preset="concept">
        <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 text-xl">
              <CalendarCheck className="text-gold size-5" aria-hidden="true" />
              {page.booking.heading}
            </h2>
            <div className="text-muted mt-5 space-y-3 text-sm leading-relaxed">
              {page.booking.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <ActionLink href={links.booking} external className="mt-6">
              {messages.common.book}
            </ActionLink>
          </div>

          <div>
            <h2 className="flex items-center gap-2 text-xl">
              <ClipboardList className="text-gold size-5" aria-hidden="true" />
              {page.beforeVisit.heading}
            </h2>
            <ul className="mt-5 space-y-3">
              {page.beforeVisit.items.map((item) => (
                <li
                  key={item}
                  className="bg-soft-pink/60 rounded-2xl px-5 py-3 text-sm leading-relaxed"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* カウンセリングと施術の流れ */}
      <Section preset="flow" sparkles>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl sm:text-2xl">{page.counseling.heading}</h2>
          <p className="text-muted mt-4 text-sm leading-relaxed sm:text-base">
            {page.counseling.body}
          </p>
        </div>

        <h3 className="font-accent text-muted mt-14 text-center text-[0.7rem] tracking-[0.28em] uppercase">
          {page.flow.heading}
        </h3>
        <div className="mt-6">
          <FlowSteps steps={messages.home.flow.steps} />
        </div>
      </Section>

      {/* 所要時間・支払い・キャンセル */}
      <Section preset="access">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <div className="gradient-frame rounded-2xl bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg">
              <Clock className="text-gold size-5" aria-hidden="true" />
              {page.duration.heading}
            </h2>
            <p className="text-muted mt-4 text-sm leading-relaxed">{page.duration.body}</p>
          </div>

          <div className="gradient-frame rounded-2xl bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg">
              <CreditCard className="text-gold size-5" aria-hidden="true" />
              {page.payment.heading}
            </h2>
            <p className="text-muted mt-4 text-sm leading-relaxed">{page.payment.body}</p>
            <PaymentMethods className="mt-4" label={page.payment.heading} />
          </div>

          <div className="gradient-frame rounded-2xl bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg">
              <XCircle className="text-gold size-5" aria-hidden="true" />
              {page.cancel.heading}
            </h2>
            <div className="text-muted mt-4 space-y-3 text-sm leading-relaxed">
              {page.cancel.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="gradient-frame rounded-2xl bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg">
              <MapPin className="text-gold size-5" aria-hidden="true" />
              {page.lost.heading}
            </h2>
            <p className="text-muted mt-4 text-sm leading-relaxed">{page.lost.body}</p>
            <ActionLink
              href={localeHref(locale, routes.access.path)}
              variant="ghost"
              className="mt-4"
            >
              {messages.home.access.cta}
            </ActionLink>
          </div>
        </div>
      </Section>

      <CTASection
        locale={locale}
        messages={messages}
        heading={page.cta.heading}
        lead={page.cta.lead}
        note={messages.home.cta.note}
      />

      <JsonLd
        data={[
          webPageJsonLd({ locale, messages, routeKey: "firstVisit", summary: page.summary }),
          jsonLd,
        ]}
      />
    </>
  );
}
