"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { QuickReplies } from "@/components/chat/QuickReplies";
import type { KnowledgeEntry } from "@/lib/chat/match";
import { buildIndex, findAnswer } from "@/lib/chat/match";
import { cn } from "@/lib/utils";

export type ChatText = {
  launcher: string;
  open: string;
  close: string;
  title: string;
  subtitle: string;
  placeholder: string;
  send: string;
  greeting: string;
  fallback: string;
  suggest: string;
  disclaimer: string;
  quickTitle: string;
  historyLabel: string;
  you: string;
  bot: string;
};

export type ChatMessage = {
  id: number;
  role: "user" | "bot";
  text: string;
  link?: KnowledgeEntry["link"];
  /** 「もしかして」で提示する候補 */
  suggestions?: KnowledgeEntry[];
};

type Props = {
  text: ChatText;
  entries: KnowledgeEntry[];
  quickReplies: KnowledgeEntry[];
};

/**
 * よくあるご質問に答えるチャット。
 *
 * ## 設計方針
 *
 * 生成AIは使っていません。このサイトは静的ホスティング（GitHub Pages）で
 * サーバーを持たないため、AIのAPIキーを置くと**閲覧者全員に見えてしまいます**。
 * 代わりに、サイト内のデータ（営業時間・料金・アクセス・よくあるご質問）を
 * 知識ベースにした検索方式で回答します。
 * そのため「サイトに書いていないこと」は答えず、案内先を示します。
 *
 * ## 実装上の注意
 *
 * - このコンポーネントは**ヘッダーの外**（レイアウト直下）に置いてください。
 *   ヘッダーは `backdrop-filter` を持つため `position: fixed` の基準になり、
 *   中に入れると画面ではなくヘッダーを基準に配置されてしまいます。
 * - モバイルでは下部固定バーと重なるため、起動ボタンの位置をずらしています。
 */
export function ChatWidget({ text, entries, quickReplies }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: "bot", text: text.greeting },
  ]);

  const index = useMemo(() => buildIndex(entries), [entries]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const nextId = useRef(1);

  // 新しい発言が増えたら最下部までスクロールします
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, open]);

  // 開いたら入力欄へフォーカスを移し、閉じたら起動ボタンへ戻します
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      return;
    }
    launcherRef.current?.focus();
  }, [open]);

  // 開いている間は背面のスクロールを止めます（モバイルで全画面になるため）
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape で閉じる／Tab をパネル内に閉じ込める
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function push(message: Omit<ChatMessage, "id">) {
    setMessages((prev) => [...prev, { ...message, id: nextId.current++ }]);
  }

  /** 質問文を受け取り、知識ベースから回答を返します */
  function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;

    push({ role: "user", text: trimmed });

    const { best, suggestions } = findAnswer(trimmed, index);
    if (best) {
      push({ role: "bot", text: best.answer, link: best.link });
    } else if (suggestions.length > 0) {
      push({ role: "bot", text: text.suggest, suggestions });
    } else {
      push({ role: "bot", text: text.fallback });
    }
  }

  /** クイック返信・候補から選ばれたとき（検索を挟まず確実に答えます） */
  function answerDirectly(entry: KnowledgeEntry) {
    push({ role: "user", text: entry.question });
    push({ role: "bot", text: entry.answer, link: entry.link });
  }

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="chat-panel"
        aria-label={text.open}
        className={cn(
          "btn-sheen fixed right-4 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white shadow-[0_12px_30px_-10px_rgba(139,61,255,0.7)] transition hover:-translate-y-0.5 sm:right-6",
          "[background-image:var(--gradient-button)]",
          // モバイルは下部の固定予約バーを避けて上に置きます
          "bottom-24 lg:bottom-6",
          open && "pointer-events-none opacity-0",
        )}
      >
        <MessageCircle className="size-5 shrink-0" aria-hidden="true" />
        <span className="max-sm:sr-only">{text.launcher}</span>
      </button>

      <div
        id="chat-panel"
        ref={panelRef}
        hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label={text.title}
        className={cn(
          "border-line fixed z-50 flex flex-col overflow-hidden border bg-white shadow-2xl",
          // モバイルは全画面、PCは右下のカード
          "inset-0 rounded-none",
          "sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[min(34rem,calc(100dvh-6rem))] sm:w-[24rem] sm:rounded-3xl",
        )}
      >
        <header className="border-line flex shrink-0 items-center justify-between gap-3 border-b bg-[image:var(--gradient-signature)] px-5 py-4 text-white">
          <div className="min-w-0">
            <p className="font-display truncate text-lg leading-tight">{text.title}</p>
            <p className="truncate text-[0.7rem] opacity-90">{text.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={text.close}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div
          ref={listRef}
          // 新しい回答をスクリーンリーダーへ読み上げます
          aria-live="polite"
          aria-label={text.historyLabel}
          className="bg-soft-pink/30 flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          {messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              youLabel={text.you}
              botLabel={text.bot}
              onSelect={answerDirectly}
            />
          ))}

          {messages.length <= 1 ? (
            <QuickReplies
              title={text.quickTitle}
              entries={quickReplies}
              onSelect={answerDirectly}
            />
          ) : null}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            ask(input);
            setInput("");
          }}
          className="border-line shrink-0 border-t bg-white px-4 pt-3 pb-4"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={text.placeholder}
              aria-label={text.placeholder}
              enterKeyHint="send"
              className="border-line focus:border-purple min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={input.trim().length === 0}
              aria-label={text.send}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-white transition disabled:opacity-40 [background-image:var(--gradient-button)]"
            >
              <Send className="size-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-muted mt-2 text-[0.65rem] leading-relaxed">{text.disclaimer}</p>
        </form>
      </div>
    </>
  );
}
