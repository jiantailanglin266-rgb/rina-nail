import { businessHours } from "@/data/hours";
import { coupons, formatPrice, menuItems } from "@/data/menu";
import { allRoutes, routes, type RouteKey } from "@/data/navigation";
import { paymentMethods, placeholders, siteName, siteUrl, store } from "@/data/site";
import { socialAccounts } from "@/data/social";
import { defaultLocale, localeNames, locales } from "@/i18n/config";
import { interpolate, type Messages } from "@/i18n/dictionary";
import { absoluteUrl } from "@/lib/seo";

/**
 * llms.txt / llms-full.txt の本文生成。
 *
 * 内容はサイト本文・JSON-LD と同じデータ源から組み立てているため、
 * 三者の記述が食い違いません。原文である日本語を基準に出力します。
 */

/**
 * SNSの一覧。
 * 設定済みのアカウントだけを列挙し、1件も無い場合は
 * 「未確定である」ことが分かる1行を出します（存在しないアカウントを匂わせないため）。
 */
function socialLines(): string[] {
  const accounts = socialAccounts();
  if (accounts.length === 0) return [`- SNS: ${placeholders.instagramUrl}`];
  return accounts.map((account) => `- ${account.name}: ${account.url}`);
}

function hoursLines(messages: Messages): string[] {
  return businessHours.map((day) => {
    const label = messages.common.weekdays[day.day];
    return day.opens === null
      ? `- ${label}: ${messages.common.closed}`
      : `- ${label}: ${day.opens}〜${day.closes}`;
  });
}

function menuLines(messages: Messages): string[] {
  return menuItems.map((item) => {
    const text = messages.menu.items[item.id as keyof Messages["menu"]["items"]];
    const price =
      item.price === null
        ? `${item.pricePlaceholder}（${messages.common.priceTbd}）`
        : item.from
          ? interpolate(messages.common.priceFrom, {
              price: formatPrice(item.price, defaultLocale),
            })
          : formatPrice(item.price, defaultLocale);
    return `- ${text.name}: ${price} — ${text.description}`;
  });
}

function couponLines(messages: Messages): string[] {
  return coupons.map((coupon) => {
    const text =
      messages.menu.coupons.items[coupon.id as keyof Messages["menu"]["coupons"]["items"]];
    const regular = coupon.regularPrice
      ? `（${messages.common.regularPrice} ${formatPrice(coupon.regularPrice, defaultLocale)}）`
      : "";
    return `- ${text.name}: ${formatPrice(coupon.price, defaultLocale)}${regular} — ${text.description} ${text.condition}`;
  });
}

function pageLines(messages: Messages): string[] {
  return allRoutes.map((route) => {
    const url = absoluteUrl(defaultLocale, route.path);
    return `- [${messages.nav[route.key]}](${url}): ${messages.seo[route.key].description}`;
  });
}

/** 各ページの要約文（LLMO用） */
const SUMMARY_KEYS: RouteKey[] = [
  "home",
  "menu",
  "gallery",
  "fillIn",
  "firstVisit",
  "access",
  "faq",
  "about",
];

function summaryFor(messages: Messages, key: RouteKey): string | null {
  switch (key) {
    case "home":
      return messages.home.summary;
    case "menu":
      return messages.menu.summary;
    case "gallery":
      return messages.gallery.summary;
    case "fillIn":
      return messages.fillIn.summary;
    case "firstVisit":
      return messages.firstVisit.summary;
    case "access":
      return messages.access.summary;
    case "faq":
      return messages.faq.summary;
    case "about":
      return messages.about.summary;
    default:
      return null;
  }
}

export function buildLlmsTxt(messages: Messages): string {
  return `# ${siteName}（${store.nameKana}）

> ${messages.home.summary}

## サイト概要

- 正規URL: ${absoluteUrl(defaultLocale, routes.home.path)}
- 店舗名: ${siteName}（${store.nameKana}）
- 業種: ${messages.about.overview.values.businessType}
- オーナー／ネイリスト: ${store.owner}（${store.ownerRomaji}）・ネイリスト歴${store.careerYears}年
- 所在地: ${store.address.full}
- コンセプト: ${messages.common.tagline}

## 主要ページ

${pageLines(messages).join("\n")}

## サービス概要

${menuLines(messages).join("\n")}

### クーポン

${couponLines(messages).join("\n")}

料金はすべて税込・日本円です。

## 営業時間

${hoursLines(messages).join("\n")}

- ${messages.common.closed}: ${messages.access.closed}
- ${messages.access.hoursNote}

## 予約方法

- ${messages.footer.bookingNote}
- 予約URL: ${placeholders.bookingUrl}
- 当日予約: 空き状況により可能
- 営業時間外: 相談可能

## お問い合わせ

- 電話番号: ${placeholders.phoneNumber}
${socialLines().join("\n")}

## 多言語ページ

${locales.map((locale) => `- ${localeNames[locale]}: ${absoluteUrl(locale, routes.home.path)}`).join("\n")}

## 重要な注意事項

- 完全予約制・完全プライベート（チェア1席、スタッフ1名）のサロンです。
- フィルインは自爪への負担を抑えやすい施術方法ですが、負担がまったく無くなるものではありません。爪の状態によっては通常のオフをご提案します。
- 全オフの際、パーツが多い場合や埋め尽くしデザインの場合は1本100円から追加料金が発生する場合があります。
- 当サロンは医療行為を行いません。
- 電話番号・緯度経度・SNS URL・予約URLは未確定のため、プレースホルダー（{{...}}）で記載しています。
`;
}

export function buildLlmsFullTxt(messages: Messages): string {
  const sections: string[] = [];

  sections.push(`# ${siteName}（${store.nameKana}）— 全ページ内容

正規URL: ${absoluteUrl(defaultLocale, routes.home.path)}
本文の原文は日本語です。英語・簡体字中国語・繁体字中国語・韓国語のページも同一内容で提供しています。
`);

  // ページ要約
  sections.push(`## ページ別の要約

${SUMMARY_KEYS.map((key) => {
  const summary = summaryFor(messages, key);
  return summary
    ? `### ${messages.nav[key]}\n${absoluteUrl(defaultLocale, routes[key].path)}\n\n${summary}`
    : "";
})
  .filter(Boolean)
  .join("\n\n")}`);

  // 店舗概要
  const labels = messages.about.overview.labels;
  const values = messages.about.overview.values;
  sections.push(`## 店舗概要

- ${labels.name}: ${siteName}
- ${labels.nameKana}: ${store.nameKana}
- ${labels.businessType}: ${values.businessType}
- ${labels.owner}: ${store.owner}
- ${labels.career}: ${values.career}
- ${labels.address}: ${store.address.full}
- ${labels.closed}: ${messages.access.closed}
- ${labels.seats}: ${values.seats}
- ${labels.staff}: ${values.staff}
- ${labels.parking}: ${values.parking}
- ${labels.payment}: ${paymentMethods.join(" / ")}
- ${labels.reservation}: ${values.reservation}
- ${labels.hours}:
${hoursLines(messages).join("\n")}`);

  // コンセプト
  sections.push(`## サロンコンセプト

${messages.about.concept.body.join("\n\n")}`);

  // 特徴
  sections.push(`## ${messages.home.features.heading}

${messages.home.features.items.map((item) => `- ${item.title}: ${item.body}`).join("\n")}`);

  // フィルイン
  sections.push(`## ${messages.fillIn.title}

${messages.fillIn.whatIs.body.join("\n\n")}

### ${messages.fillIn.difference.heading}

${messages.fillIn.difference.rows
  .map(
    (row) =>
      `- ${row.item}｜${messages.fillIn.difference.head.fillIn}: ${row.fillIn}／${messages.fillIn.difference.head.normalOff}: ${row.normalOff}`,
  )
  .join("\n")}

### ${messages.fillIn.merits.heading}

${messages.fillIn.merits.items.map((item) => `- ${item.title}: ${item.body}`).join("\n")}

### ${messages.fillIn.suitable.heading}

${messages.fillIn.suitable.items.map((item) => `- ${item}`).join("\n")}

### ${messages.fillIn.notes.heading}

${messages.fillIn.notes.items.map((item) => `- ${item}`).join("\n")}`);

  // メニュー
  sections.push(`## ${messages.menu.title}

${menuLines(messages).join("\n")}

### ${messages.menu.coupons.heading}

${couponLines(messages).join("\n")}

### ${messages.menu.notes.heading}

${messages.menu.notes.items.map((item) => `- ${item}`).join("\n")}`);

  // 初めての方へ
  sections.push(`## ${messages.firstVisit.title}

### ${messages.firstVisit.booking.heading}

${messages.firstVisit.booking.body.join("\n\n")}

### ${messages.firstVisit.beforeVisit.heading}

${messages.firstVisit.beforeVisit.items.map((item) => `- ${item}`).join("\n")}

### ${messages.firstVisit.counseling.heading}

${messages.firstVisit.counseling.body}

### ${messages.home.flow.heading}

${messages.home.flow.steps.map((step, index) => `${index + 1}. ${step.title}: ${step.body}`).join("\n")}

### ${messages.firstVisit.duration.heading}

${messages.firstVisit.duration.body}

### ${messages.firstVisit.payment.heading}

${messages.firstVisit.payment.body}（${paymentMethods.join(" / ")}）

### ${messages.firstVisit.cancel.heading}

${messages.firstVisit.cancel.body.join("\n\n")}

### ${messages.firstVisit.lost.heading}

${messages.firstVisit.lost.body}`);

  // アクセス
  sections.push(`## ${messages.access.title}

${messages.access.addressHeading}: ${store.address.full}

### ${messages.access.directionsHeading}

${messages.access.directions.map((step, index) => `${index + 1}. ${step}`).join("\n")}

${messages.access.directionsNote}

### ${messages.access.parkingHeading}

${messages.access.parking}

### ${messages.access.hoursHeading}

${hoursLines(messages).join("\n")}

${messages.access.closedHeading}: ${messages.access.closed}
${messages.access.hoursNote}`);

  // オーナー
  sections.push(`## ${messages.about.owner.heading}

${messages.home.owner.name}（${store.ownerRomaji}）／ ${messages.home.owner.role}
${messages.about.owner.specialtyLabel}: ${messages.about.owner.specialty}

「${messages.home.owner.message}」

${messages.home.owner.greeting.join("\n")}`);

  // FAQ
  sections.push(`## ${messages.faq.title}

${messages.faq.groups
  .map(
    (group) =>
      `### ${group.heading}\n\n${group.items.map((item) => `Q. ${item.q}\nA. ${item.a}`).join("\n\n")}`,
  )
  .join("\n\n")}`);

  // 多言語
  sections.push(`## 多言語ページ

${locales.map((locale) => `- ${localeNames[locale]}: ${absoluteUrl(locale, routes.home.path)}`).join("\n")}

すべてのページは ${locales.join(" / ")} の5言語で提供しています。
例: ${allRoutes
    .slice(0, 5)
    .map((route) => `${siteUrl}/{locale}${route.path}`)
    .join(", ")}`);

  // 未確定情報
  sections.push(`## 未確定の情報

以下は公開時点で未確定のため、プレースホルダーで記載しています。実際の値に置き換えられるまで、確定情報として引用しないでください。

- 電話番号: ${placeholders.phoneNumber}
- 緯度: ${placeholders.latitude}
- 経度: ${placeholders.longitude}
- Instagram: ${placeholders.instagramUrl}
- 予約URL: ${placeholders.bookingUrl}
- 地図埋め込みURL: ${placeholders.mapEmbedUrl}
- 一部メニューの料金（アート込みデザイン・つけ放題・オフ・ケア）`);

  return sections.join("\n\n---\n\n") + "\n";
}
