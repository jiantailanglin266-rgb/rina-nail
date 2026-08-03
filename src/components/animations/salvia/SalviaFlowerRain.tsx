import { FallingSalviaLayer } from "@/components/animations/salvia/FallingSalviaLayer";
import {
  buildSalviaConfigs,
  SECTION_DEFAULTS,
  type SalviaColorMode,
  type SalviaDensity,
  type SalviaSectionVariant,
} from "@/components/animations/salvia/salviaAnimationConfig";
import { cn } from "@/lib/utils";

export type SalviaFlowerRainProps = {
  density?: SalviaDensity;
  variant?: SalviaSectionVariant;
  showFlowers?: boolean;
  showPetals?: boolean;
  showBranches?: boolean;
  showSparkles?: boolean;
  colorMode?: SalviaColorMode;
  className?: string;
};

/**
 * 四日市市の花「サルビア」が舞い落ちる背景装飾。
 *
 * 地域に根ざしたサロンであることを、上品な装飾として視覚的に伝えます。
 * 四日市市の公式ロゴ・紋章は使用せず、あくまでデザインモチーフとしての利用です。
 *
 * ## 実装方針
 * - すべてCSSアニメーション。クライアントJSを一切増やしません
 *   （`prefers-reduced-motion` は globals.css と `motion-reduce:` で対応）
 * - 配置は `salviaAnimationConfig.ts` でシード付き疑似乱数から決定的に生成するため、
 *   Hydration Error が起きません
 * - Canvas / WebGL は不使用
 *
 * ## 使い方
 * ```tsx
 * <section className="relative isolate overflow-hidden">
 *   <ColorfulGradientBackground preset="hero" intensity="high" className="-z-30" />
 *   <SalviaFlowerRain variant="hero" density="high" className="-z-10" />
 *   <div className="relative z-10">{children}</div>
 * </section>
 * ```
 */
export function SalviaFlowerRain({
  density,
  variant = "section",
  showFlowers = true,
  showPetals = true,
  showBranches,
  showSparkles = true,
  colorMode,
  className,
}: SalviaFlowerRainProps) {
  const defaults = SECTION_DEFAULTS[variant];

  const configs = buildSalviaConfigs({
    density: density ?? defaults.density,
    section: variant,
    colorMode: colorMode ?? defaults.colorMode,
    showFlowers,
    showPetals,
    showBranches: showBranches ?? defaults.showBranches,
    showSparkles,
  });

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden select-none", className)}
    >
      <FallingSalviaLayer configs={configs} />
    </div>
  );
}
