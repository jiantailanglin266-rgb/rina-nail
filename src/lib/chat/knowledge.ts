import { businessHours } from "@/data/hours";
import { formatPrice, menuItems } from "@/data/menu";
import { localeHref, routes } from "@/data/navigation";
import { store } from "@/data/site";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";
import { bookingLink } from "@/lib/booking";
import type { ChatLink, KnowledgeEntry } from "@/lib/chat/match";

/**
 * チャットの知識ベース。
 *
 * **回答はすべて既存のデータ（`src/data/`）と翻訳ファイルから組み立てます。**
 * チャット用に文言を別途書き起こすと、料金や営業時間を変更したときに
 * 本文・構造化データ・チャットの三者がずれ、
 * 「サイトには18時と書いてあるのにチャットは17時と答える」といった事故が起きます。
 *
 * 生成AIは使っていません。静的ホスティングではAPIキーを安全に保持できないためです
 * （詳しくは `docs/CHATBOT.md`）。
 */

/** クイック返信に出す順番。よく聞かれる順に並べます */
export const quickReplyIds = ["booking", "hours", "price", "access", "faq-firstTime"] as const;

function link(label: string, href: string, external = false): ChatLink {
  return { label, href, external };
}

/** 営業時間の一覧を「月曜日: 10:00〜18:00」の形で組み立てます */
function hoursLines(messages: Messages): string {
  return businessHours
    .map((day) => {
      const label = messages.common.weekdays[day.day];
      return day.opens === null
        ? `${label}: ${messages.common.closed}`
        : `${label}: ${day.opens}〜${day.closes}`;
    })
    .join("\n");
}

/** 料金が確定しているメニューだけを一覧にします（未確定のものは出しません） */
function priceLines(locale: Locale, messages: Messages): string {
  return menuItems
    .map((item) => {
      const text = messages.menu.items[item.id as keyof Messages["menu"]["items"]];
      if (item.price === null) return `${text.name}: ${messages.common.priceTbd}`;
      const price = formatPrice(item.price, locale);
      return `${text.name}: ${item.from ? `${price}〜` : price}`;
    })
    .join("\n");
}

/**
 * 知識ベースを組み立てます。
 *
 * 1. よくある質問ページの全項目（翻訳済みなので5言語すべてで機能します）
 * 2. データから答えを組み立てる項目（営業時間・料金・アクセスなど）
 */
export function buildKnowledge(locale: Locale, messages: Messages): KnowledgeEntry[] {
  const chat = messages.chat;
  const booking = bookingLink(locale);
  const href = (key: keyof typeof routes) => localeHref(locale, routes[key].path);

  /*
   * 1. よくある質問ページの項目。回答の文面はこちらが正です。
   *
   * 質問文だけでは「爪が薄い」「男性でも行ける？」といった別の言い方を拾えないため、
   * 項目ごとの手がかり語（`chat.faqKeywords`）を添えます。
   * 手がかり語は翻訳ファイル側にあるので、5言語すべてで同じ精度になります。
   */
  const faqKeywords = chat.faqKeywords as Record<string, string[]>;
  const faqEntries: KnowledgeEntry[] = messages.faq.groups.flatMap((group) =>
    group.items.map((item) => ({
      id: `faq-${item.id}`,
      question: item.q,
      answer: item.a,
      keywords: faqKeywords[item.id] ?? [],
      link: link(messages.nav.faq, href("faq")),
    })),
  );

  // 2. データから組み立てる項目
  const dataEntries: KnowledgeEntry[] = [
    {
      id: "booking",
      question: chat.intents.booking.question,
      keywords: chat.intents.booking.keywords,
      answer: `${messages.footer.bookingNote}\n${messages.access.hoursNote}`,
      link: link(messages.common.book, booking.href, booking.external),
    },
    {
      id: "hours",
      question: chat.intents.hours.question,
      keywords: chat.intents.hours.keywords,
      answer: `${hoursLines(messages)}\n\n${messages.access.closed}\n${messages.access.hoursNote}`,
      link: link(messages.nav.access, href("access")),
    },
    {
      id: "price",
      question: chat.intents.price.question,
      keywords: chat.intents.price.keywords,
      answer: `${priceLines(locale, messages)}\n\n${messages.common.taxIncluded}`,
      link: link(messages.nav.menu, href("menu")),
    },
    {
      id: "access",
      question: chat.intents.access.question,
      keywords: chat.intents.access.keywords,
      answer: `${store.address.full}\n\n${messages.access.parking}`,
      link: link(messages.nav.access, href("access")),
    },
    {
      id: "flow",
      question: chat.intents.flow.question,
      keywords: chat.intents.flow.keywords,
      answer: messages.home.flow.steps
        .map((step, index) => `${index + 1}. ${step.title}｜${step.body}`)
        .join("\n"),
      link: link(messages.nav.firstVisit, href("firstVisit")),
    },
    {
      id: "menu",
      question: chat.intents.menu.question,
      keywords: chat.intents.menu.keywords,
      answer: menuItems
        .map((item) => messages.menu.items[item.id as keyof Messages["menu"]["items"]].name)
        .join(" / "),
      link: link(messages.nav.menu, href("menu")),
    },
    {
      id: "gallery",
      question: chat.intents.gallery.question,
      keywords: chat.intents.gallery.keywords,
      answer: messages.gallery.lead,
      link: link(messages.nav.gallery, href("gallery")),
    },
    {
      id: "salon",
      question: chat.intents.salon.question,
      keywords: chat.intents.salon.keywords,
      answer: messages.about.lead,
      link: link(messages.nav.about, href("about")),
    },
  ];

  return [...dataEntries, ...faqEntries];
}

/** クイック返信として出す項目を、定義順に取り出します */
export function quickReplies(entries: KnowledgeEntry[]): KnowledgeEntry[] {
  return quickReplyIds
    .map((id) => entries.find((entry) => entry.id === id))
    .filter((entry): entry is KnowledgeEntry => Boolean(entry));
}
