import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { BusinessHours } from "@/components/sections/BusinessHours";
import { CTASection } from "@/components/sections/CTASection";
import { OwnerProfile } from "@/components/sections/OwnerProfile";
import { PaymentMethods } from "@/components/sections/PaymentMethods";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { localeHref, routes, utilityNavKeys } from "@/data/navigation";
import { paymentMethods, siteName, store } from "@/data/site";
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
  return pageMetadata({ locale, messages, routeKey: "about" });
}

export default async function AboutPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);
  const about = messages.about;
  const labels = about.overview.labels;
  const values = about.overview.values;
  const { crumbs, jsonLd } = buildBreadcrumbs(locale, messages, "about");

  /**
   * サロン概要の表。
   * 生成AIが拾いやすいよう、本文だけでなく表形式でも同じ情報を掲載しています。
   */
  const overviewRows: Array<{ label: string; value: React.ReactNode }> = [
    { label: labels.name, value: siteName },
    ...(locale === "ja" ? [{ label: labels.nameKana, value: store.nameKana }] : []),
    { label: labels.businessType, value: values.businessType },
    { label: labels.owner, value: store.owner },
    { label: labels.career, value: values.career },
    {
      label: labels.address,
      value: (
        <>
          <span lang="ja">{store.address.full}</span>
          {locale !== "ja" ? (
            <span className="text-muted mt-1 block" lang="en">
              {store.address.fullEn}
            </span>
          ) : null}
        </>
      ),
    },
    { label: labels.hours, value: <BusinessHours messages={messages} /> },
    { label: labels.closed, value: messages.access.closed },
    { label: labels.seats, value: values.seats },
    { label: labels.staff, value: values.staff },
    { label: labels.parking, value: values.parking },
    { label: labels.payment, value: paymentMethods.join(" / ") },
    { label: labels.reservation, value: values.reservation },
    { label: labels.languages, value: values.languages },
  ];

  return (
    <>
      <Breadcrumbs items={crumbs} label={messages.common.breadcrumbLabel} />
      <PageHeader
        eyebrow="ABOUT THE SALON"
        title={about.title}
        lead={about.lead}
        summary={about.summary}
        summaryLabel={messages.common.summaryLabel}
      />

      {/* サロン概要（表） */}
      <Section preset="access">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl sm:text-2xl">{about.overview.heading}</h2>
          <div className="border-line mt-6 overflow-hidden rounded-2xl border">
            <table className="w-full text-sm">
              <caption className="sr-only">{about.overview.caption}</caption>
              <tbody>
                {overviewRows.map((row) => (
                  <tr key={row.label} className="border-line border-b last:border-0">
                    <th
                      scope="row"
                      className="bg-soft-pink/50 w-2/5 px-4 py-3 text-left align-top font-medium sm:w-1/3 sm:px-6"
                    >
                      {row.label}
                    </th>
                    <td className="px-4 py-3 align-top sm:px-6">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* オーナープロフィール */}
      <Section preset="owner" sparkles>
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl sm:text-2xl">{about.owner.heading}</h2>
          <OwnerProfile messages={messages} showSpecialty className="mt-10" />
        </div>
      </Section>

      {/* コンセプト・設備 */}
      <Section preset="concept">
        <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-xl sm:text-2xl">{about.concept.heading}</h2>
            <div className="text-muted mt-5 space-y-4 text-sm leading-relaxed">
              {about.concept.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl">{about.facility.heading}</h2>
            <ul className="mt-5 space-y-3">
              {about.facility.items.map((item) => (
                <li
                  key={item}
                  className="bg-soft-lilac/60 rounded-2xl px-5 py-3 text-sm leading-relaxed"
                >
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-xl sm:text-2xl">{about.payment.heading}</h2>
            <PaymentMethods className="mt-5" label={about.payment.heading} />
            <p className="text-muted mt-3 text-xs">{about.payment.note}</p>

            <h2 className="mt-10 text-xl sm:text-2xl">{about.legal.heading}</h2>
            <ul className="mt-5 space-y-2 text-sm">
              {utilityNavKeys.map((key) => (
                <li key={key}>
                  <Link
                    href={localeHref(locale, routes[key].path)}
                    className="text-purple hover:text-neon-pink underline underline-offset-4 transition"
                  >
                    {messages.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
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
          webPageJsonLd({ locale, messages, routeKey: "about", summary: about.summary }),
          jsonLd,
        ]}
      />
    </>
  );
}
