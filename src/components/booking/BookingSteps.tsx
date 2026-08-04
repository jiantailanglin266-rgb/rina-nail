import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  labels: string[];
  /** 0始まりの現在位置 */
  current: number;
  stepOfLabel: string;
};

/**
 * 進行状況の表示。
 *
 * 色だけで現在地を示すと、色覚特性によっては区別できません。
 * 完了には ✓ を、現在地には太字と `aria-current` を付け、
 * 「ステップ 3 / 6」という文字でも位置が分かるようにしています。
 */
export function BookingSteps({ labels, current, stepOfLabel }: Props) {
  return (
    <nav aria-label={stepOfLabel}>
      <p className="text-muted mb-3 text-center text-xs">{stepOfLabel}</p>

      <ol className="flex items-center justify-center gap-1 sm:gap-2">
        {labels.map((label, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <li key={label} className="flex items-center gap-1 sm:gap-2">
              <div className="flex flex-col items-center gap-1">
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full text-[0.7rem] font-medium transition sm:size-8 sm:text-xs",
                    done && "bg-purple text-white",
                    active && "text-white [background-image:var(--gradient-button)]",
                    !done && !active && "border-line text-muted border bg-white",
                  )}
                >
                  {done ? <Check className="size-4" /> : index + 1}
                </span>
                <span
                  {...(active ? { "aria-current": "step" as const } : {})}
                  className={cn(
                    "max-w-[4.5rem] text-center text-[0.6rem] leading-tight sm:text-[0.7rem]",
                    active ? "text-ink font-medium" : "text-muted",
                  )}
                >
                  {label}
                </span>
              </div>
              {index < labels.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={cn("mb-4 h-px w-2 sm:w-5", done ? "bg-purple" : "bg-line")}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
