import type { CSSProperties } from "react";

import { GoldenSparkle } from "@/components/animations/salvia/GoldenSparkle";
import { SalviaBranch } from "@/components/animations/salvia/SalviaBranch";
import { SalviaFlower } from "@/components/animations/salvia/SalviaFlower";
import { SalviaPetal } from "@/components/animations/salvia/SalviaPetal";
import type { FallingSalviaConfig } from "@/components/animations/salvia/salviaAnimationConfig";
import { cn } from "@/lib/utils";

type Props = {
  configs: FallingSalviaConfig[];
};

/**
 * 落下するサルビアを1枚のレイヤーとして描画します。
 *
 * 3つの div を入れ子にし、それぞれ別のアニメーションを担当させています。
 *   外側 … 落下＋横流れ（translate3d）
 *   中間 … 左右の揺れ（別周期にして単調さを消す）
 *   内側 … ゆっくりした回転
 *
 * transform と opacity しか動かさないため、レイアウトの再計算が起きません。
 * すべてCSSアニメーションで完結するため、クライアントJSは不要です
 * （`prefers-reduced-motion` も globals.css 側で処理されます）。
 */
export function FallingSalviaLayer({ configs }: Props) {
  return (
    <>
      {configs.map((c) => {
        const fallStyle = {
          left: `${c.startX}vw`,
          "--salvia-duration": `${c.duration}s`,
          "--salvia-drift": `${c.drift}vw`,
          "--salvia-opacity": String(c.opacity),
          "--salvia-static-y": `${c.staticY}vh`,
          animationDelay: `${c.delay}s`,
          filter: c.blur > 0 ? `blur(${c.blur}px)` : undefined,
        } as CSSProperties;

        const swayStyle = {
          "--salvia-sway": `${c.swayDistance}vw`,
          "--salvia-sway-duration": `${c.swaySpeed}s`,
          animationDelay: `${c.delay / 2}s`,
        } as CSSProperties;

        const spinStyle = {
          "--salvia-rot-from": `${c.rotationFrom}deg`,
          "--salvia-rot-to": `${c.rotationTo}deg`,
          "--salvia-spin-duration": `${c.spinSpeed}s`,
          animationDelay: `${c.delay / 3}s`,
        } as CSSProperties;

        return (
          <div
            key={c.id}
            aria-hidden="true"
            className={cn(
              "salvia-fall absolute top-0",
              c.hideAt === "mobile" && "salvia-mobile-hidden",
              c.hideAt === "tablet" && "salvia-tablet-hidden",
              // 動きを止めたとき、静止装飾として残さない個体
              c.staticHidden && "motion-reduce:hidden",
            )}
            style={fallStyle}
          >
            <div className="salvia-sway" style={swayStyle}>
              <div className="salvia-spin" style={spinStyle}>
                {c.type === "flower" ? (
                  <SalviaFlower
                    uid={c.id}
                    size={c.size}
                    variant={c.variant}
                    direction={c.direction}
                  />
                ) : null}
                {c.type === "branch" ? (
                  <SalviaBranch
                    uid={c.id}
                    size={c.size}
                    variant={c.variant}
                    direction={c.direction}
                  />
                ) : null}
                {c.type === "petal" ? (
                  <SalviaPetal uid={c.id} size={c.size} variant={c.variant} />
                ) : null}
                {c.type === "sparkle" ? <GoldenSparkle size={c.size} /> : null}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
