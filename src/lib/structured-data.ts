import { galleryItems } from "@/data/gallery";
import { coupons, menuItems } from "@/data/menu";
import { openDays } from "@/data/hours";
import { routes, type RouteKey } from "@/data/navigation";
import {
  areaServed,
  defaultOgImage,
  mapLinkUrl,
  paymentMethods,
  placeholders,
  resolved,
  sameAsUrls,
  siteName,
  siteUrl,
  store,
} from "@/data/site";
import { localeHtmlLang, locales, type Locale } from "@/i18n/config";
import { interpolate, type Messages } from "@/i18n/dictionary";
import { absoluteUrl } from "@/lib/seo";

/**
 * JSON-LD の組み立て。
 *
 * 本文に書かれている内容と一致させることを最優先にしています
 * （営業時間・住所・料金・支払い方法・サービス内容はすべて同じデータ源から生成）。
 *
 * **未確定の値（`{{...}}`）は出力しません。**
 * プレースホルダー文字列をそのまま出力すると、緯度経度や電話番号が
 * 不正な値として解釈され、LocalBusiness 全体が無効と判定されるおそれがあります。
 * 「間違った値がある」より「項目が無い」ほうが安全なため、未確定の項目は丸ごと省きます。
 * 公開前に環境変数で実際の値を設定してください（`docs/PLACEHOLDERS.md`）。
 */

const salonId = `${siteUrl}/#salon`;
const websiteId = `${siteUrl}/#website`;
const personId = `${siteUrl}/#owner`;

type JsonLdObject = Record<string, unknown>;

/** 値が `undefined` のキーを取り除きます（未確定の項目を出力しないため） */
function compact(obj: JsonLdObject): JsonLdObject {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
}

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

/** 緯度・経度。両方そろっている場合のみ出力します */
function geoCoordinates(): JsonLdObject | undefined {
  const latitude = resolved(placeholders.latitude);
  const longitude = resolved(placeholders.longitude);
  if (!latitude || !longitude) return undefined;
  return { "@type": "GeoCoordinates", latitude, longitude };
}

/**
 * 予約導線。
 *
 * サイト内に予約ページがあるため、常にそこを指します。
 * 外部の予約サイトURLが設定されている場合はそちらを優先します。
 */
function reserveAction(locale: Locale): JsonLdObject | undefined {
  const bookingUrl = resolved(placeholders.bookingUrl) ?? absoluteUrl(locale, routes.booking.path);
  return {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: bookingUrl,
      inLanguage: localeHtmlLang[locale],
      actionPlatform: [
        "https://schema.org/DesktopWebPlatform",
        "https://schema.org/MobileWebPlatform",
      ],
    },
    result: { "@type": "Reservation", name: siteName },
  };
}

/** 店舗本体。NailSalon を主型とし、LocalBusiness / BeautySalon も併記します。 */
export function salonJsonLd(locale: Locale, messages: Messages): JsonLdObject {
  const sameAs = sameAsUrls();

  return compact({
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
    geo: geoCoordinates(),
    // 緯度経度が未設定でも、地図の場所は hasMap で示せます
    hasMap: mapLinkUrl(),
    telephone: resolved(placeholders.phoneNumber),
    openingHoursSpecification: openingHours(),
    priceRange: store.priceRange,
    currenciesAccepted: store.currency,
    paymentAccepted: paymentMethods.join(", "),
    availableLanguage: locales.map((l) => localeHtmlLang[l]),
    areaServed: areaServed.map((area) => ({ "@type": area.type, name: area.name })),
    amenityFeature: {
      "@type": "LocationFeatureSpecification",
      name: messages.about.overview.labels.parking,
      value: messages.about.overview.values.parking,
    },
    founder: { "@id": personId },
    employee: { "@id": personId },
    // 未設定なら空配列になるため、キーごと落とします
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    potentialAction: reserveAction(locale),
    makesOffer: services(locale, messages).map((s) => (s as { offers: unknown }).offers),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: messages.menu.title,
      itemListElement: services(locale, messages),
    },
  });
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

/**
 * 施術の流れを HowTo として出力します。
 *
 * 「ネイルサロン 初めて」「施術の流れ」のような Know クエリと、
 * 生成AIの「どういう流れですか？」という質問の両方に答えられる形にします。
 * 手順は本文（home.flow.steps）と同じデータ源なので、記述がずれません。
 */
export function howToJsonLd(locale: Locale, messages: Messages): JsonLdObject {
  const flow = messages.home.flow;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${siteUrl}/#howto-flow`,
    name: flow.heading,
    description: messages.firstVisit.lead,
    inLanguage: localeHtmlLang[locale],
    step: flow.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.body,
      url: `${absoluteUrl(locale, routes.firstVisit.path)}#flow`,
    })),
  };
}

/**
 * デザインギャラリーを ImageObject として出力します。
 *
 * 画像検索と、生成AIが「どんなデザインがあるか」を説明する際の
 * 引用元になることを狙っています。
 */
export function galleryImagesJsonLd(locale: Locale, messages: Messages): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": `${absoluteUrl(locale, routes.gallery.path)}#gallery`,
    name: messages.gallery.title,
    description: messages.gallery.summary,
    inLanguage: localeHtmlLang[locale],
    isPartOf: { "@id": websiteId },
    associatedMedia: galleryItems.map((item, index) => {
      const alt = interpolate(messages.gallery.altTemplate, {
        category: messages.gallery.categories[item.category],
        index: index + 1,
      });
      return {
        "@type": "ImageObject",
        contentUrl: `${siteUrl}${item.src}`,
        url: absoluteUrl(locale, routes.gallery.path),
        name: alt,
        caption: alt,
        width: item.width,
        height: item.height,
        creator: { "@id": personId },
        creditText: siteName,
      };
    }),
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
    /**
     * 音声アシスタントや読み上げに、まず読ませたい範囲を指定します。
     * 各ページ冒頭の見出しと要約ブロックを対象にしています。
     */
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable]"],
    },
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
