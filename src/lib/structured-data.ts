import { coupons, menuItems } from "@/data/menu";
import { openDays } from "@/data/hours";
import { routes, type RouteKey } from "@/data/navigation";
import {
  defaultOgImage,
  paymentMethods,
  placeholders,
  sameAsUrls,
  siteName,
  siteUrl,
  store,
} from "@/data/site";
import { localeHtmlLang, locales, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";
import { absoluteUrl } from "@/lib/seo";

/**
 * JSON-LD の組み立て。
 *
 * 本文に書かれている内容と一致させることを最優先にしています
 * （営業時間・住所・料金・支払い方法・サービス内容はすべて同じデータ源から生成）。
 *
 * 電話番号・緯度経度・SNS URL・予約URLは未確定のため、
 * `src/data/site.ts` のプレースホルダーをそのまま出力します。
 * 公開前に環境変数で実際の値へ差し替えてください。
 */

const salonId = `${siteUrl}/#salon`;
const websiteId = `${siteUrl}/#website`;
const personId = `${siteUrl}/#owner`;

type JsonLdObject = Record<string, unknown>;

function postalAddress(): JsonLdObject {
  return {
    "@type": "PostalAddress",
    streetAddress: store.address.street,
    addressLocality: store.address.city,
    addressRegion: store.address.region,
    addressCountry: store.address.country,
  };
}

function openingHours(): JsonLdObject[] {
  return openDays.map((day) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: `https://schema.org/${day.schemaDay}`,
    opens: day.opens,
    closes: day.closes,
  }));
}

/** メニューを Service + Offer として表現します */
function services(locale: Locale, messages: Messages): JsonLdObject[] {
  const items = menuItems.map((item) => {
    const text = messages.menu.items[item.id as keyof Messages["menu"]["items"]];
    const offer: JsonLdObject = {
      "@type": "Offer",
      name: text.name,
      priceCurrency: store.currency,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(locale, routes.menu.path),
      ...(item.price !== null
        ? item.from
          ? {
              priceSpecification: {
                "@type": "PriceSpecification",
                minPrice: item.price,
                priceCurrency: store.currency,
              },
            }
          : { price: item.price }
        : {}),
    };

    return {
      "@type": "Service",
      "@id": `${siteUrl}/#service-${item.id}`,
      name: text.name,
      description: text.description,
      serviceType: text.name,
      provider: { "@id": salonId },
      areaServed: { "@type": "City", name: store.address.city },
      offers: offer,
    } satisfies JsonLdObject;
  });

  const couponOffers = coupons.map((coupon) => {
    const text =
      messages.menu.coupons.items[coupon.id as keyof Messages["menu"]["coupons"]["items"]];
    return {
      "@type": "Service",
      "@id": `${siteUrl}/#coupon-${coupon.id}`,
      name: text.name,
      description: `${text.description} ${text.condition}`,
      provider: { "@id": salonId },
      offers: {
        "@type": "Offer",
        name: text.name,
        price: coupon.price,
        priceCurrency: store.currency,
        availability: "https://schema.org/InStock",
        url: absoluteUrl(locale, routes.menu.path),
      },
    } satisfies JsonLdObject;
  });

  return [...items, ...couponOffers];
}

/** オーナー／ネイリスト */
export function personJsonLd(messages: Messages): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId,
    name: store.owner,
    alternateName: store.ownerRomaji,
    jobTitle: messages.home.owner.role,
    knowsAbout: messages.about.owner.specialty,
    worksFor: { "@id": salonId },
    url: siteUrl,
  };
}

/** 店舗本体。NailSalon を主型とし、LocalBusiness / BeautySalon も併記します。 */
export function salonJsonLd(locale: Locale, messages: Messages): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": ["NailSalon", "BeautySalon", "LocalBusiness"],
    "@id": salonId,
    name: siteName,
    alternateName: store.nameKana,
    description: messages.seo.home.description,
    url: absoluteUrl(locale, routes.home.path),
    image: `${siteUrl}${defaultOgImage}`,
    logo: `${siteUrl}/icon.png`,
    address: postalAddress(),
    geo: {
      "@type": "GeoCoordinates",
      latitude: placeholders.latitude,
      longitude: placeholders.longitude,
    },
    telephone: placeholders.phoneNumber,
    openingHoursSpecification: openingHours(),
    priceRange: store.priceRange,
    currenciesAccepted: store.currency,
    paymentAccepted: paymentMethods.join(", "),
    availableLanguage: locales.map((l) => localeHtmlLang[l]),
    amenityFeature: {
      "@type": "LocationFeatureSpecification",
      name: messages.about.overview.labels.parking,
      value: messages.about.overview.values.parking,
    },
    founder: { "@id": personId },
    employee: { "@id": personId },
    sameAs: sameAsUrls(),
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: placeholders.bookingUrl,
        inLanguage: localeHtmlLang[locale],
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
      result: { "@type": "Reservation", name: siteName },
    },
    makesOffer: services(locale, messages).map((s) => (s as { offers: unknown }).offers),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: messages.menu.title,
      itemListElement: services(locale, messages),
    },
  };
}

/** サイト全体 */
export function websiteJsonLd(locale: Locale, messages: Messages): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: siteName,
    alternateName: store.nameKana,
    url: absoluteUrl(locale, routes.home.path),
    description: messages.seo.home.description,
    inLanguage: locales.map((l) => localeHtmlLang[l]),
    publisher: { "@id": salonId },
  };
}

/** 各ページ。要約文（summary）を description に流用し、本文と一致させます。 */
export function webPageJsonLd({
  locale,
  messages,
  routeKey,
  summary,
}: {
  locale: Locale;
  messages: Messages;
  routeKey: RouteKey;
  summary?: string;
}): JsonLdObject {
  const path = routes[routeKey].path;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(locale, path)}#webpage`,
    url: absoluteUrl(locale, path),
    name: messages.seo[routeKey].title,
    description: summary ?? messages.seo[routeKey].description,
    inLanguage: localeHtmlLang[locale],
    isPartOf: { "@id": websiteId },
    about: { "@id": salonId },
    primaryImageOfPage: `${siteUrl}${defaultOgImage}`,
  };
}

export type BreadcrumbEntry = { name: string; url: string };

export function breadcrumbJsonLd(entries: BreadcrumbEntry[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.url,
    })),
  };
}

export function faqJsonLd(messages: Messages): JsonLdObject {
  const items = messages.faq.groups.flatMap((group) => group.items);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
