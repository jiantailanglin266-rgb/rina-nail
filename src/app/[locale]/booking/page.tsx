import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertCircle, CalendarCheck, Mail, Phone, ShieldCheck } from "lucide-react";

import { BookingUnavailable } from "@/components/booking/BookingUnavailable";
import { GoogleBookingCalendar } from "@/components/booking/GoogleBookingCalendar";
import { BookingPageView } from "@/components/booking/BookingPageView";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import {
  bookingNoticeKeys,
  bookingPolicyKeys,
  checkBookingUrl,
  fallbackContact,
  googleBookingUrl,
  isBookingConfigured,
} from "@/data/booking/config";
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
  // 予約ページは検索から入ってきてほしいページなので noindex は付けません
  return pageMetadata({ locale, messages, routeKey: "booking" });
}

/**
 * 開発中だけ表示する、設定の不備の説明。
 *
 * 本番ビルドでは `undefined` を返すため、お客様の画面には一切出ません。
 */
function developerHint(): string | undefined {
  if (process.env.NODE_ENV === "production") return undefined;

  const check = checkBookingUrl(googleBookingUrl);
  if (check.valid) return undefined;

  const reasons: Record<string, string> = {
    empty:
      "Google予約ページURLが未設定です。.env.local へ NEXT_PUBLIC_GOOGLE_BOOKING_URL を設定してください。",
    scheme: "予約ページURLが https で始まっていません。",
    host: "GoogleカレンダーのURLではありません（calendar.google.com / calendar.app.google のみ受け付けます）。",
    malformed: "予約ページURLの形式が正しくありません。",
  };
  return `[開発表示] ${reasons[check.reason]}`;
}

export default async function BookingPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);
  const text = messages.booking;
  const { crumbs, jsonLd } = buildBreadcrumbs(locale, messages, "booking");
  const configured = isBookingConfigured();
  const contact = fallbackContact();

  return (
    <>
      {/* 予約ページの表示を計測します（個人情報は送りません） */}
      <BookingPageView />

      <Breadcrumbs items={crumbs} label={messages.common.breadcrumbLabel} />

      {/* 1. ページタイトル / 2. 短い案内文 */}
      <PageHeader
        eyebrow="RESERVATION"
        title={text.title}
        lead={text.lead}
        summary={text.summary}
        summaryLabel={messages.common.summaryLabel}
      />

      <Section
        preset="plain"
        salvia={{ variant: "section", density: "low", showFlowers: false, showBranches: false }}
      >
        <div className="mx-auto max-w-3xl space-y-10">
          {/* 3. 予約前の注意事項 */}
          <section aria-labelledby="booking-notices">
            <h2 id="booking-notices" className="flex items-center gap-2 text-lg">
              <AlertCircle className="text-gold size-5" aria-hidden="true" />
              {text.noticesHeading}
            </h2>
            <ul className="border-line mt-4 space-y-2.5 rounded-2xl border bg-white p-5 text-sm leading-relaxed">
              {bookingNoticeKeys.map((key) => (
                <li key={key} className="flex gap-2">
                  <span className="text-gold shrink-0" aria-hidden="true">
                    ・
                  </span>
                  <span>{text.notices[key]}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 4. Googleカレンダー予約画面（未設定なら準備中の案内へ） */}
          <section aria-labelledby="booking-calendar">
            <h2 id="booking-calendar" className="flex items-center gap-2 text-lg">
              <CalendarCheck className="text-gold size-5" aria-hidden="true" />
              {text.calendarHeading}
            </h2>
            <div className="mt-4">
              {configured ? (
                <GoogleBookingCalendar messages={messages} />
              ) : (
                <BookingUnavailable
                  locale={locale}
                  messages={messages}
                  developerHint={developerHint()}
                />
              )}
            </div>
          </section>

          {/* 5. 予約後の案内 */}
          <section aria-labelledby="booking-after">
            <h2 id="booking-after" className="flex items-center gap-2 text-lg">
              <Mail className="text-gold size-5" aria-hidden="true" />
              {text.afterHeading}
            </h2>
            <ul className="border-line mt-4 space-y-2.5 rounded-2xl border bg-white p-5 text-sm leading-relaxed">
              {(["mailSent", "mailIsConfirmation", "mailNotArrived"] as const).map((key) => (
                <li key={key} className="flex gap-2">
                  <span className="text-gold shrink-0" aria-hidden="true">
                    ・
                  </span>
                  <span>{text.after[key]}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 6. 変更・キャンセルについて */}
          <section aria-labelledby="booking-change">
            <h2 id="booking-change" className="text-lg">
              {text.changeHeading}
            </h2>
            <div className="border-line mt-4 rounded-2xl border bg-white p-5 text-sm leading-relaxed">
              <p>{text.change.fromMail}</p>
              <p className="mt-2">{text.change.sameDay}</p>
            </div>

            <h3 className="mt-6 text-base">{text.policiesHeading}</h3>
            <dl className="border-line divide-line mt-3 divide-y rounded-2xl border bg-white text-sm">
              {bookingPolicyKeys.map((key) => (
                <div key={key} className="p-4 sm:flex sm:gap-4">
                  <dt className="text-muted shrink-0 font-medium sm:w-40">
                    {text.policies[key].label}
                  </dt>
                  <dd className="mt-1 leading-relaxed sm:mt-0">{text.policies[key].body}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* 7. 電話・問い合わせへの案内 */}
          <section aria-labelledby="booking-contact">
            <h2 id="booking-contact" className="flex items-center gap-2 text-lg">
              <Phone className="text-gold size-5" aria-hidden="true" />
              {text.contactHeading}
            </h2>
            <div className="border-line mt-4 rounded-2xl border bg-white p-5 text-sm leading-relaxed">
              <p>{text.contactLead}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {contact.telHref ? (
                  <a
                    href={contact.telHref}
                    className="border-line hover:border-purple inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm transition"
                  >
                    <Phone className="size-4" aria-hidden="true" />
                    {contact.phone}
                  </a>
                ) : null}
                <a
                  href={localeHref(locale, routes.access.path)}
                  className="border-line hover:border-purple inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm transition"
                >
                  {messages.nav.access}
                </a>
              </div>
            </div>
          </section>

          {/* 8. プライバシーポリシーへのリンク */}
          <section aria-labelledby="booking-privacy">
            <h2 id="booking-privacy" className="flex items-center gap-2 text-lg">
              <ShieldCheck className="text-gold size-5" aria-hidden="true" />
              {text.privacyHeading}
            </h2>
            <div className="border-line mt-4 rounded-2xl border bg-white p-5 text-sm leading-relaxed">
              <p>{text.privacyLead}</p>
              <a
                href={localeHref(locale, routes.privacy.path)}
                className="text-purple mt-3 inline-block underline underline-offset-4"
              >
                {messages.nav.privacy}
              </a>
            </div>
          </section>
        </div>
      </Section>

      <JsonLd
        data={[
          webPageJsonLd({ locale, messages, routeKey: "booking", summary: text.summary }),
          jsonLd,
        ]}
      />
    </>
  );
}
