"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { bookingSettings } from "@/data/booking/settings";
import { formatDate, isBookableDate } from "@/lib/booking/availability";
import type { Messages } from "@/i18n/dictionary";
import { cn } from "@/lib/utils";

type Props = {
  messages: Messages;
  locale: string;
  value: string | null;
  onSelect: (date: string) => void;
  /** 「今」の基準。テストから固定値を渡せるようにしています */
  now?: Date;
};

/**
 * 月表示のカレンダー。
 *
 * 予約できない日はボタン自体を `disabled` にし、
 * 見た目（薄い色）だけに頼らず支援技術にも伝わるようにしています。
 * タップ領域は44px以上を確保しています。
 */
export function DatePicker({ messages, locale, value, onSelect, now = new Date() }: Props) {
  const text = messages.booking;
  const [monthOffset, setMonthOffset] = useState(0);

  const { year, month, cells, canGoBack, canGoForward } = useMemo(() => {
    const base = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const y = base.getFullYear();
    const m = base.getMonth();

    const firstWeekday = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const list: (string | null)[] = Array.from({ length: firstWeekday }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      list.push(`${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    }

    const limit = new Date(now.getTime());
    limit.setDate(limit.getDate() + bookingSettings.bookableDaysAhead);

    return {
      year: y,
      month: m,
      cells: list,
      canGoBack: monthOffset > 0,
      canGoForward: new Date(y, m + 1, 1) <= limit,
    };
  }, [monthOffset, now]);

  const monthLabel = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(
    new Date(year, month, 1),
  );
  const weekdayLabels = [
    messages.common.weekdays.sun,
    messages.common.weekdays.mon,
    messages.common.weekdays.tue,
    messages.common.weekdays.wed,
    messages.common.weekdays.thu,
    messages.common.weekdays.fri,
    messages.common.weekdays.sat,
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonthOffset((prev) => prev - 1)}
          disabled={!canGoBack}
          // ステップの「戻る／次へ」と読み上げが重ならないよう、月送り専用のラベルにします
          aria-label={text.prevMonth}
          className="border-line hover:border-purple inline-flex size-11 items-center justify-center rounded-full border transition disabled:opacity-30"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <p className="font-display text-lg">{monthLabel}</p>
        <button
          type="button"
          onClick={() => setMonthOffset((prev) => prev + 1)}
          disabled={!canGoForward}
          aria-label={text.nextMonth}
          className="border-line hover:border-purple inline-flex size-11 items-center justify-center rounded-full border transition disabled:opacity-30"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1" role="grid">
        {weekdayLabels.map((label) => (
          <div key={label} className="text-muted pb-1 text-center text-[0.65rem]">
            {label.slice(0, 1)}
          </div>
        ))}

        {cells.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;

          const bookable = isBookableDate(date, now);
          const selected = value === date;
          const day = Number(date.split("-")[2]);
          const isToday = date === formatDate(now);

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              disabled={!bookable}
              aria-pressed={selected}
              aria-label={`${date}${bookable ? "" : `（${text.closedDay}）`}`}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center rounded-xl text-sm transition",
                selected && "text-white [background-image:var(--gradient-button)]",
                !selected && bookable && "border-line hover:border-purple border bg-white",
                !bookable && "text-muted/50 cursor-not-allowed line-through",
                isToday && !selected && "ring-gold/50 ring-1",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
