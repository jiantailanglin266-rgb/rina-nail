import { ArrowUpRight } from "lucide-react";

import type { ChatMessage } from "@/components/chat/ChatWidget";
import type { KnowledgeEntry } from "@/lib/chat/match";
import { withBasePath } from "@/lib/base-path";
import { cn } from "@/lib/utils";

type Props = {
  message: ChatMessage;
  youLabel: string;
  botLabel: string;
  onSelect: (entry: KnowledgeEntry) => void;
};

/** 発言1件分。回答は改行をそのまま段落として表示します。 */
export function ChatMessageBubble({ message, youLabel, botLabel, onSelect }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col gap-1.5", isUser ? "items-end" : "items-start")}>
      <span className="text-muted px-1 text-[0.6rem]">{isUser ? youLabel : botLabel}</span>

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line",
          isUser
            ? "rounded-br-sm text-white [background-image:var(--gradient-button)]"
            : "border-line text-ink rounded-bl-sm border bg-white",
        )}
      >
        {message.text}
      </div>

      {/* 回答に対応するページへの導線 */}
      {message.link ? (
        <a
          href={
            message.link.external ? message.link.href : withBasePath(message.link.href)
          }
          {...(message.link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-purple hover:text-neon-pink inline-flex items-center gap-1 px-1 text-xs underline underline-offset-4 transition"
        >
          {message.link.label}
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </a>
      ) : null}

      {/* 確信が持てなかったときの候補 */}
      {message.suggestions?.length ? (
        <ul className="mt-1 flex flex-col items-start gap-1.5">
          {message.suggestions.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onSelect(entry)}
                className="border-line hover:border-purple hover:text-purple rounded-full border bg-white px-3 py-1.5 text-left text-xs transition"
              >
                {entry.question}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
