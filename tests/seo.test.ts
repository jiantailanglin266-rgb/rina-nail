import { describe, expect, it } from "vitest";

import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import ja from "@/i18n/messages/ja.json";
import { allRoutes } from "@/data/navigation";
import { locales } from "@/i18n/config";
import { siteUrl } from "@/data/site";
import { buildLanguageAlternates } from "@/lib/seo";
import {
  faqJsonLd,
  galleryImagesJsonLd,
  howToJsonLd,
  salonJsonLd,
  webPageJsonLd,
} from "@/lib/structured-data";
import { galleryItems } from "@/data/gallery";
import { buildLlmsTxt } from "@/lib/llms-txt";

describe("sitemap.xml", () => {
  const entries = sitemap();

  it("全言語 × 全ページのURLを含む", () => {
    expect(entries).toHaveLength(locales.length * allRoutes.length);
  });

  it("URLが重複していない", () => {
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("すべてのURLに hreflang（x-default 含む）が付いている", () => {
    for (const entry of entries) {
      const languages = entry.alternates?.languages ?? {};
      expect(Object.keys(languages)).toContain("x-default");
      expect(Object.keys(languages)).toHaveLength(locales.length + 1);
    }
  });
});

describe("robots.txt", () => {
  const config = robots();

  it("インデックスを拒否していない", () => {
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    for (const rule of rules) {
      expect(rule.disallow).toBeUndefined();
      expect(rule.allow).toBe("/");
    }
  });

  it("主要な生成AIクローラーを許可している", () => {
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const agents = rules.map((rule) => rule.userAgent);
    for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) {
      expect(agents).toContain(bot);
    }
  });

  it("sitemap を指している", () => {
    expect(config.sitemap).toBe(`${siteUrl}/sitemap.xml`);
  });
});

describe("hreflang", () => {
  it("x-default は原文（日本語）を指す", () => {
    const languages = buildLanguageAlternates("/menu");
    expect(languages["x-default"]).toBe(`${siteUrl}/ja/menu/`);
    expect(languages.ja).toBe(`${siteUrl}/ja/menu/`);
    expect(languages["zh-Hant"]).toBe(`${siteUrl}/zh-tw/menu/`);
  });
});

describe("URLの正規化", () => {
  /**
   * 静的エクスポートは `trailingSlash: true` のため、正規URLは末尾スラッシュ付きです。
   * sitemap と canonical / hreflang の表記がずれると、
   * sitemap 上の全URLが「リダイレクトされるURL」として扱われます。
   */
  it("sitemap のURLがすべて末尾スラッシュ付き（canonical と同じ表記）", () => {
    for (const entry of sitemap()) {
      expect(entry.url.endsWith("/")).toBe(true);
    }
  });

  it("sitemap のURLと hreflang のURLが完全に一致する", () => {
    const sitemapUrls = new Set(sitemap().map((entry) => entry.url));
    for (const entry of sitemap()) {
      for (const url of Object.values(entry.alternates?.languages ?? {})) {
        expect(sitemapUrls.has(url as string)).toBe(true);
      }
    }
  });
});

describe("構造化データ", () => {
  it("NailSalon を主型に含む", () => {
    const data = salonJsonLd("ja", ja) as { "@type": string[] };
    expect(data["@type"][0]).toBe("NailSalon");
    expect(data["@type"]).toContain("LocalBusiness");
  });

  it("営業日のみ openingHoursSpecification に含める（土日は除外）", () => {
    const data = salonJsonLd("ja", ja) as {
      openingHoursSpecification: Array<{ dayOfWeek: string }>;
    };
    const days = data.openingHoursSpecification.map((spec) => spec.dayOfWeek);
    expect(days).toHaveLength(5);
    expect(days).not.toContain("https://schema.org/Saturday");
  });

  it("FAQPage の質問数が本文と一致する", () => {
    const data = faqJsonLd(ja) as { mainEntity: unknown[] };
    const bodyCount = ja.faq.groups.reduce((total, group) => total + group.items.length, 0);
    expect(data.mainEntity).toHaveLength(bodyCount);
  });

  it("WebPage の description に本文の要約をそのまま使う", () => {
    const data = webPageJsonLd({
      locale: "ja",
      messages: ja,
      routeKey: "home",
      summary: ja.home.summary,
    }) as { description: string };
    expect(data.description).toBe(ja.home.summary);
  });
});

describe("llms.txt", () => {
  const text = buildLlmsTxt(ja);

  it("店舗の基本情報を含む", () => {
    expect(text).toContain("Rina nail");
    expect(text).toContain("三重県四日市市平尾町3082-5");
    expect(text).toContain("中村 梨奈");
  });

  it("全ページのURLを列挙している", () => {
    for (const route of allRoutes) {
      expect(text).toContain(`${siteUrl}/ja${route.path}`);
    }
  });

  it("未確定の項目をプレースホルダーとして明示している", () => {
    expect(text).toContain("{{PHONE_NUMBER}}");
    expect(text).toContain("{{BOOKING_URL}}");
  });

  it("断定的な医療・効果表現を含まない", () => {
    for (const forbidden of ["傷まない", "治る", "治療", "No.1", "日本一"]) {
      expect(text).not.toContain(forbidden);
    }
  });
});

describe("未確定情報の扱い（構造化データ）", () => {
  /**
   * プレースホルダー（`{{...}}`）を JSON-LD にそのまま出力すると、
   * 緯度経度や電話番号が不正な値として解釈され、
   * LocalBusiness 全体が無効と判定されるおそれがあります。
   * 「間違った値がある」より「項目が無い」ほうが安全なため、未確定の項目は出力しません。
   */
  const salon = salonJsonLd("ja", ja);
  const serialized = JSON.stringify(salon);

  it("JSON-LD にプレースホルダー文字列が一切出力されない", () => {
    expect(serialized).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });

  it("未設定の緯度経度・電話番号・予約導線はキーごと省略される", () => {
    expect(salon).not.toHaveProperty("geo");
    expect(salon).not.toHaveProperty("telephone");
    expect(salon).not.toHaveProperty("potentialAction");
  });

  it("緯度経度が無くても地図の場所は hasMap で示している", () => {
    expect(String(salon.hasMap)).toContain("google.com/maps");
  });

  it("商圏（areaServed）に四日市市を含む", () => {
    const areas = salon.areaServed as { name: string }[];
    expect(areas.map((a) => a.name)).toContain("四日市市");
  });
});

describe("HowTo / ImageGallery", () => {
  it("施術の流れを HowTo として出力し、手順が本文と同数", () => {
    const howTo = howToJsonLd("ja", ja) as { "@type": string; step: unknown[] };
    expect(howTo["@type"]).toBe("HowTo");
    expect(howTo.step).toHaveLength(ja.home.flow.steps.length);
  });

  it("ギャラリーの全画像を ImageObject として出力する", () => {
    const gallery = galleryImagesJsonLd("ja", ja) as { associatedMedia: { name: string }[] };
    expect(gallery.associatedMedia).toHaveLength(galleryItems.length);
    for (const image of gallery.associatedMedia) {
      expect(image.name.length).toBeGreaterThan(0);
    }
  });
});
