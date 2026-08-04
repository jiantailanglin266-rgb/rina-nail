import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarX } from "lucide-react";

import { BookingFlow } from "@/components/booking/BookingFlow";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { ActionLink } from "@/components/ui/ActionLink";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { isBookingEnabled } from "@/data/booking/settings";
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
  return pageMetadata({ locale, messages, routeKey: "booking" });
}

export default async function BookingPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);
  const { crumbs, jsonLd } = buildBreadcrumbs(locale, messages, "booking");
  const enabled = isBookingEnabled();

  return (
    <>
      <Breadcrumbs items={crumbs} label={messages.common.breadcrumbLabel} />
      <PageHeader
        eyebrow="RESERVATION"
        title={messages.booking.title}
        lead={messages.booking.lead}
        summary={messages.booking.summary}
        summaryLabel={messages.common.summaryLabel}
      />

      <Section preset="plain" salvia={{ variant: "section", density: "low", showFlowers: false, showBranches: false }}>
        <div className="mx-auto max-w-2xl">
          {enabled ? (
            <BookingFlow locale={locale} messages={messages} />
          ) : (
            /*
             * 予約APIが未設定のときは、フォームを出さずに案内へ切り替えます。
             * 押しても何も起きないフォームを見せるより、
             * 連絡手段を示すほうがお客様の役に立つためです。
             */
            <div className="gradient-frame glass-card rounded-3xl p-8 text-center">
              <span className="bg-soft-lilac text-purple mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full">
                <CalendarX className="size-7" aria-hidden="true" />
              </span>
              <h2 className="font-display text-xl">{messages.booking.disabled.heading}</h2>
              <p className="text-muted mt-3 text-sm leading-relaxed">
                {messages.booking.disabled.lead}
              </p>
              <ActionLink
                href={localeHref(locale, routes.access.path)}
                variant="secondary"
                className="mt-6"
              >
                {messages.nav.access}
              </ActionLink>
            </div>
          )}
        </div>
      </Section>

      <JsonLd
        data={[
          webPageJsonLd({
            locale,
            messages,
            routeKey: "booking",
            summary: messages.booking.summary,
          }),
          jsonLd,
        ]}
      />
    </>
  );
}
