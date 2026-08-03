import { cn } from "@/lib/utils";

type Props = {
  animated?: boolean;
  className?: string;
};

/**
 * 虹色の反射（プリズムのような光沢）。
 *
 * ヒーローと予約CTAだけに使う、最も華やかな装飾です。
 * ベタ塗りのレインボーにならないよう、不透明度を大きく落とし、
 * 端に向かって完全に透明になる円錐グラデーションで表現しています。
 */
export function RainbowLight({ animated = true, className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full",
        animated && "anim-rainbow-breathe",
        className,
      )}
      style={{
        background: [
          "conic-gradient(from 210deg at 50% 50%,",
          "rgb(255 224 138 / 0.22) 0deg,",
          "rgb(255 95 200 / 0.20) 80deg,",
          "rgb(139 61 255 / 0.18) 160deg,",
          "rgb(85 199 255 / 0.18) 240deg,",
          "rgb(255 200 182 / 0.20) 310deg,",
          "rgb(255 224 138 / 0.22) 360deg)",
        ].join(" "),
        // 中心から外へ向かって消し、円盤ではなく「光の滲み」に見せます
        maskImage: "radial-gradient(circle at 50% 50%, #000 0%, transparent 68%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 0%, transparent 68%)",
        filter: "blur(50px)",
      }}
    />
  );
}
