import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ManageBooking } from "@/components/booking/ManageBooking";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionary";
import type { LocalePageProps } from "@/lib/route-params";

/**
 * 予約の確認・変更・キャンセル。
 *
 * 予約確認メールのリンク（`?token=...`）から開きます。
 * トークンを含むURLなので、検索結果に出ないよう `noindex` を付けています。
 * これはサイト全体の方針（noindexを入れない）の例外で、
 * 個人の予約ページを検索エンジンに載せないための措置です。
 */
export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);

  return {
    title: messages.booking.manage.title,
    description: messages.booking.manage.lead,
    robots: { index: false, follow: false },
  };
}

export default async function BookingManagePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const messages = await getMessages(locale);

  return (
    <>
      <PageHeader
        eyebrow="RESERVATION"
        title={messages.booking.manage.title}
        lead={messages.booking.manage.lead}
        summary={messages.booking.manage.lead}
        summaryLabel={messages.common.summaryLabel}
      />

      <Section
        preset="plain"
        salvia={{ variant: "section", density: "low", showFlowers: false, showBranches: false }}
      >
        <div className="mx-auto max-w-2xl">
          <ManageBooking locale={locale} messages={messages} />
        </div>
      </Section>
    </>
  );
}
