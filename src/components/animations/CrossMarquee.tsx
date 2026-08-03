import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type Direction = "left" | "right";
type BandVariant = "solid" | "outline";

type BandProps = {
  items: readonly string[];
  direction: Direction;
  variant: BandVariant;
  /**
   * 傾ける向き。`1` と `-1` を組み合わせることで2本が交差します。
   * 角度そのものは画面幅に応じて `.cross-band`（globals.css）が決めます
   * （広い画面ほど、同じ角度でも端の振れ幅が大きくなるため）。
   */
  tilt: 1 | -1;
  /** 1周にかける秒数。大きいほどゆっくり流れます */
  durationSeconds?: number;
  className?: string;
};

/**
 * 斜めに傾いたマーキーの帯を1本描きます。
 *
 * 同じ内容を2セット並べてトラックを -50% 動かすため、継ぎ目なくループします
 * （`Marquee` と同じ方式・同じCSSアニメーションを使っています）。
 */
export function MarqueeBand({
  items,
  direction,
  variant,
  tilt,
  durationSeconds,
  className,
}: BandProps) {
  const duration = durationSeconds ?? (direction === "left" ? 42 : 50);
  const sequence = [...items, ...items];

  return (
    <div
      className={cn(
        "cross-band marquee-hover absolute top-1/2 left-1/2 flex overflow-hidden py-2.5 sm:py-3.5",
        // 画面より広くして、傾けても左右の端に隙間ができないようにします
        "w-[135%]",
        variant === "solid"
          ? "text-white shadow-[0_10px_30px_-12px_rgb(122_45_168/0.5)] [background-image:var(--gradient-signature)]"
          : "border-gold/35 bg-white/92 border-y backdrop-blur-sm",
        className,
      )}
      style={
        {
          "--marquee-duration": `${duration}s`,
          "--cross-dir": tilt,
        } as CSSProperties
      }
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
            className="font-display text-lg leading-none whitespace-nowrap sm:text-2xl lg:text-3xl"
          >
            {variant === "solid" ? (
              item
            ) : (
              <span
                className={cn(
                  "text-gradient",
                  index % 2 === 0 ? "text-gradient-pink-purple" : "text-gradient-purple-gold",
                )}
              >
                {item}
              </span>
            )}
            <span
              className={cn("ml-8 sm:ml-12", variant === "solid" ? "text-white/60" : "text-gold/45")}
            >
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

type Props = {
  lineOne: readonly string[];
  lineTwo: readonly string[];
  className?: string;
};

/**
 * X字に交差する2本のマーキー。ページ下部（フッターの直前）に置きます。
 *
 * - 2本を逆向きに傾け、さらに逆方向へ流すことで中央で交差します
 * - 装飾であり情報伝達の主手段ではないため `aria-hidden` を付けています
 *   （同じ内容は本文側にも記載しています）
 * - 傾けた帯が横スクロールを生まないよう、外側で `overflow-hidden` しています
 * - 高さを固定しているため、読み込み前後でレイアウトがずれません（CLS対策）
 * - `prefers-reduced-motion` では globals.css 側でトラックが停止し、
 *   交差した帯が静止したグラフィックとして残ります
 */
export function CrossMarquee({ lineOne, lineTwo, className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative isolate w-full overflow-hidden select-none",
        "h-36 sm:h-44 lg:h-52",
        className,
      )}
    >
      <MarqueeBand items={lineOne} direction="left" variant="solid" tilt={-1} />
      <MarqueeBand items={lineTwo} direction="right" variant="outline" tilt={1} className="z-10" />
    </div>
  );
}
