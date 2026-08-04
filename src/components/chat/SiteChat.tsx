import { ChatWidget } from "@/components/chat/ChatWidget";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";
import { buildKnowledge, quickReplies } from "@/lib/chat/knowledge";

type Props = {
  locale: Locale;
  messages: Messages;
};

/**
 * チャットのサーバー側の入り口。
 *
 * 知識ベースの組み立て（データと翻訳の結合）はここ＝**ビルド時**に行い、
 * クライアントへは出来上がった配列だけを渡します。
 * こうすることで、ブラウザ側では検索処理だけを実行すればよくなります。
 */
export function SiteChat({ locale, messages }: Props) {
  const entries = buildKnowledge(locale, messages);

  return (
    <ChatWidget
      text={{
        launcher: messages.chat.launcher,
        open: messages.chat.open,
        close: messages.chat.close,
        title: messages.chat.title,
        subtitle: messages.chat.subtitle,
        placeholder: messages.chat.placeholder,
        send: messages.chat.send,
        greeting: messages.chat.greeting,
        fallback: messages.chat.fallback,
        suggest: messages.chat.suggest,
        disclaimer: messages.chat.disclaimer,
        quickTitle: messages.chat.quickTitle,
        historyLabel: messages.chat.historyLabel,
        you: messages.chat.you,
        bot: messages.chat.bot,
      }}
      entries={entries}
      quickReplies={quickReplies(entries)}
    />
  );
}
