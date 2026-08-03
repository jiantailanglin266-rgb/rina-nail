import type { CSSProperties } from "react";

import type { OrbConfig } from "@/components/backgrounds/gradientPresets";
import { cn } from "@/lib/utils";

type Props = {
  orb: OrbConfig;
  /** 強度による不透明度の倍率 */
  opacityScale?: number;
  animated?: boolean;
  className?: string;
};

/**
 * 半透明のカラーオーブ1つ。
 *
 * ぼかした円形グラデーションを `transform` と `opacity` だけで
 * ゆっくり漂わせます（20〜40秒）。
 *
 * `mix-blend-mode` は使いません。本文やネイル写真の色が崩れるのを防ぐため、
 * 重なりは透明度とグラデーションだけで表現しています。
 */
export function GradientOrb({ orb, opacityScale = 1, animated = true, className }: Props) {
  const style: CSSProperties = {
    width: orb.size,
    height: orb.size,
    top: orb.top,
    left: orb.left,
    right: orb.right,
    bottom: orb.bottom,
    opacity: orb.opacity * opacityScale,
    background: `radial-gradient(circle at 35% 35%, ${orb.from}, ${orb.to ?? "rgb(255 255 255 / 0)"} 70%)`,
    // ぼかしはレスポンシブで段階的に弱めます（--orb-blur-scale は globals.css で定義）
    filter: `blur(calc(${orb.blur}px * var(--orb-blur-scale, 1)))`,
    animationDuration: `${orb.duration}s`,
    animationDelay: `${orb.delay}s`,
    ["--orb-shift-x" as string]: orb.shiftX,
    ["--orb-shift-y" as string]: orb.shiftY,
    ["--orb-scale" as string]: String(orb.scale),
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full",
        animated && "anim-orb",
        orb.hideAt === "mobile" && "orb-mobile-hidden",
        orb.hideAt === "tablet" && "orb-tablet-hidden",
        className,
      )}
      style={style}
    />
  );
}
