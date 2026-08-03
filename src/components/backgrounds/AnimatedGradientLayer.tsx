import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type Props = {
  /** 第1層のベース背景（ホワイト基調） */
  base: string;
  /** 多層の radial-gradient をカンマ区切りで並べたもの */
  mesh: string;
  opacity?: number;
  animated?: boolean;
  className?: string;
};

/**
 * ベース背景とメッシュグラデーションを重ねる層。
 *
 * `background-position` をゆっくり動かすことで、
 * 色の境界が呼吸しているように見せます（34秒／1周）。
 */
export function AnimatedGradientLayer({
  base,
  mesh,
  opacity = 1,
  animated = true,
  className,
}: Props) {
  const hasMesh = mesh.length > 0;

  return (
    <>
      <div
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0", className)}
        style={{ background: base }}
      />
      {hasMesh ? (
        <div
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-0", animated && "anim-mesh", className)}
          style={
            {
              backgroundImage: mesh,
              // アニメーションで位置を動かせるよう、描画領域を少し広げます
              backgroundSize: "140% 140%",
              backgroundRepeat: "no-repeat",
              opacity,
            } as CSSProperties
          }
        />
      ) : null}
    </>
  );
}
