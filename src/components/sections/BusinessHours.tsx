import { businessHours } from "@/data/hours";
import type { Messages } from "@/i18n/dictionary";
import { cn } from "@/lib/utils";

type Props = {
  messages: Messages;
  className?: string;
  /** 見出し行を表示するか */
  showCaption?: boolean;
};

/** 営業時間の表。曜日ラベルは翻訳ファイル、時間は `src/data/hours.ts` から取得します。 */
export function BusinessHours({ messages, className, showCaption = false }: Props) {
  return (
    <table className={cn("w-full text-sm", className)}>
      {showCaption ? <caption className="sr-only">{messages.access.hoursHeading}</caption> : null}
      <tbody>
        {businessHours.map((day) => {
          const closed = day.opens === null;
          return (
            <tr key={day.day} className="border-line/70 border-b last:border-0">
              <th scope="row" className="py-2 pr-4 text-left font-medium whitespace-nowrap">
                {messages.common.weekdays[day.day]}
              </th>
              <td className={cn("py-2 text-right tabular-nums", closed && "text-muted")}>
                {closed ? messages.common.closed : `${day.opens}〜${day.closes}`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
