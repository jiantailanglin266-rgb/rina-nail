import type { KnowledgeEntry } from "@/lib/chat/match";

type Props = {
  title: string;
  entries: KnowledgeEntry[];
  onSelect: (entry: KnowledgeEntry) => void;
};

/**
 * よく聞かれる質問のボタン。
 *
 * 「何を聞けばいいか分からない」状態を作らないために、
 * 会話の最初に必ず提示します。ボタンから選ばれた場合は検索を経由せず、
 * 対応する回答をそのまま返します（取り違えが起きません）。
 */
export function QuickReplies({ title, entries, onSelect }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="pt-2">
      <p className="text-muted px-1 pb-2 text-[0.65rem] tracking-wide">{title}</p>
      <ul className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              onClick={() => onSelect(entry)}
              className="border-line hover:border-purple hover:text-purple rounded-full border bg-white px-3 py-2 text-left text-xs transition"
            >
              {entry.question}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
