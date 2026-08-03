import type { ReactNode } from "react";

import { GradientSection } from "@/components/backgrounds/GradientSection";
import type { Intensity, PresetName } from "@/components/backgrounds/gradientPresets";

type Props = {
  children: ReactNode;
  /**
   * セクションごとの背景プリセット。
   * 色・不透明度・オーブ数は `src/components/backgrounds/gradientPresets.ts` で定義しています。
   */
  preset?: PresetName;
  /** 背景の強さ。low ほど白に近づきます */
  intensity?: Intensity;
  /** ゴールドの曲線・光粒を重ねるか */
  sparkles?: boolean;
  id?: string;
  className?: string;
  "aria-labelledby"?: string;
};

/**
 * セクション共通のレイアウト（余白を広く取り、圧迫感を出さない）。
 * 背景の描画は GradientSection に委譲しています。
 */
export function Section({
  children,
  preset = "plain",
  intensity = "medium",
  sparkles = false,
  id,
  className,
  ...rest
}: Props) {
  return (
    <GradientSection
      id={id}
      preset={preset}
      intensity={intensity}
      sparkles={sparkles}
      className={className}
      {...rest}
    >
      <div className="container-page">{children}</div>
    </GradientSection>
  );
}
