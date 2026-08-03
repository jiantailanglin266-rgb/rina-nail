import type { ReactNode } from "react";

import { AnimatedGoldBackground } from "@/components/animations/AnimatedGoldBackground";
import { ColorfulGradientBackground } from "@/components/backgrounds/ColorfulGradientBackground";
import type { Intensity, PresetName } from "@/components/backgrounds/gradientPresets";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  preset?: PresetName;
  intensity?: Intensity;
  animated?: boolean;
  /** ゴールドの曲線・光粒（第3層）を重ねるか */
  sparkles?: boolean;
  /** 上下の余白を省き、内側で調整したい場合に使います */
  bare?: boolean;
  as?: "section" | "div";
  id?: string;
  className?: string;
  "aria-labelledby"?: string;
};

/**
 * 背景付きセクションの土台。
 *
 * `isolate` を付けることで、内部の負の z-index が
 * ヘッダー（z-50）やモバイル固定バー（z-40）へ影響しません。
 * 背景は -z-10 以下、コンテンツは z-10 に固定しています。
 */
export function GradientSection({
  children,
  preset = "plain",
  intensity = "medium",
  animated = true,
  sparkles = false,
  bare = false,
  as: Tag = "section",
  id,
  className,
  ...rest
}: Props) {
  return (
    <Tag
      id={id}
      className={cn(
        "relative isolate overflow-hidden",
        !bare && "py-16 sm:py-20 lg:py-24",
        className,
      )}
      {...rest}
    >
      <ColorfulGradientBackground
        preset={preset}
        intensity={intensity}
        animated={animated}
        className="-z-20"
      />

      {sparkles ? <AnimatedGoldBackground density="soft" className="-z-10" /> : null}

      <div className="relative z-10">{children}</div>
    </Tag>
  );
}
