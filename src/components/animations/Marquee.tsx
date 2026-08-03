import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type Props = {
  items: readonly string[];
  /** 流れる向き */
  direction?: "left" | "right";
  /** 1周にかける秒数。大きいほどゆっくり流れます */
  durationSeconds?: number;
  className?: string;
};

/**
 * シームレスに無限ループするマーキー。
 *
 * 同じ内容を2セット並べ、トラック全体を -50% 移動させることで
 * 継ぎ目なくループします（テキストが途中で切れて見えません）。
 *
 * 装飾であり情報伝達の主手段ではないため `aria-hidden` を付け、
 * 同じ情報は必ず本文側にも記載しています。
 */
export function Marquee({ items, direction = "left", durationSeconds, className }: Props) {
  const duration = durationSeconds ?? (direction === "left" ? 48 : 56);
  const sequence = [...items, ...items];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "marquee-hover relative flex w-full overflow-hidden select-none",
        // 両端をフェードさせ、唐突に切れて見えないようにします
        "[mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]",
        className,
      )}
      style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
    >
      <div
        className={cn(
          "flex w-max shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12",
          direction === "left" ? "marquee-track-left" : "marquee-track-right",
        )}
      >
        {sequence.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="font-display text-2xl leading-none whitespace-nowrap sm:text-4xl lg:text-5xl"
          >
            <span
              className={cn(
                "text-gradient",
                index % 3 === 0
                  ? "text-gradient-gold-pink"
                  : index % 3 === 1
                    ? "text-gradient-pink-purple"
                    : "text-gradient-purple-gold",
              )}
            >
              {item}
            </span>
            <span className="text-gold/40 ml-8 sm:ml-12">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
