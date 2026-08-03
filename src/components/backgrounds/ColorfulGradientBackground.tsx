import { AnimatedGradientLayer } from "@/components/backgrounds/AnimatedGradientLayer";
import { ColorfulGlow } from "@/components/backgrounds/ColorfulGlow";
import { GradientOrb } from "@/components/backgrounds/GradientOrb";
import { RainbowLight } from "@/components/backgrounds/RainbowLight";
import {
  gradientPresets,
  intensityOrbLimit,
  intensityScale,
  type Intensity,
  type PresetName,
} from "@/components/backgrounds/gradientPresets";
import { cn } from "@/lib/utils";

export type ColorfulGradientBackgroundProps = {
  preset?: PresetName;
  intensity?: Intensity;
  animated?: boolean;
  showOrbs?: boolean;
  showGoldLight?: boolean;
  className?: string;
};

/**
 * セクション背景の本体。3層をまとめて描画します。
 *
 *   第1層 … ベース背景＋メッシュグラデーション（AnimatedGradientLayer）
 *   第2層 … カラーオーブ（GradientOrb ×N）
 *   第3層 … ゴールドの光条・虹色の反射（ColorfulGlow / RainbowLight）
 *
 * すべて `aria-hidden` かつ `pointer-events-none` で、
 * 読み上げにもクリック操作にも影響しません。
 * クライアントJSは使わず、CSSアニメーションのみで動きます。
 *
 * 呼び出し側のセクションには `relative isolate overflow-hidden` を付けてください
 * （`GradientSection` を使えば自動で付きます）。
 */
export function ColorfulGradientBackground({
  preset = "plain",
  intensity = "medium",
  animated = true,
  showOrbs = true,
  showGoldLight,
  className,
}: ColorfulGradientBackgroundProps) {
  const config = gradientPresets[preset];
  const scale = intensityScale[intensity];
  const orbs = showOrbs ? config.orbs.slice(0, intensityOrbLimit[intensity]) : [];
  const goldLight = showGoldLight ?? config.goldLight;

  return (
    <div
      aria-hidden="true"
      className={cn("bg-layer pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <AnimatedGradientLayer
        base={config.base}
        mesh={config.mesh}
        opacity={scale}
        animated={animated}
      />

      {orbs.map((orb, index) => (
        <GradientOrb key={index} orb={orb} opacityScale={scale} animated={animated} />
      ))}

      {/*
        中央の白いヴェール。
        オーブより手前に重ねることで色が画面の端に寄り、
        本文とCTAのある中央は白のまま保たれます（「白背景の上に光が乗る」状態）。
      */}
      {config.veil > 0 ? (
        <div
          className="absolute inset-0"
          style={{
            background: [
              // 中央を強く白へ。CTA・本文まわりの可読性を確保します
              `radial-gradient(ellipse 96% 84% at 50% 46%, rgb(255 255 255 / ${config.veil}), rgb(255 255 255 / 0) 82%)`,
              // 全面にごく薄い白をかけ、四隅の彩度を落とします
              `linear-gradient(rgb(255 255 255 / ${config.veil * 0.42}), rgb(255 255 255 / ${config.veil * 0.42}))`,
            ].join(", "),
          }}
        />
      ) : null}

      {config.rainbow ? (
        <RainbowLight
          animated={animated}
          className="orb-mobile-hidden top-[8%] right-[-6%] size-[26rem]"
        />
      ) : null}

      {goldLight ? <ColorfulGlow animated={animated} /> : null}
    </div>
  );
}
