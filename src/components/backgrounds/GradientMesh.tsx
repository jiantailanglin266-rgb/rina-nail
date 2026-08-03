import { cn } from "@/lib/utils";

type Props = {
  /** 4色メッシュの不透明度 */
  opacity?: number;
  animated?: boolean;
  className?: string;
};

/**
 * 4色を柔らかく混ぜたメッシュグラデーション。
 *
 * `gradientPresets` を経由せず、単体で「カラフルな面」が欲しいときに使います
 * （マーキーの帯、カードの内側など）。
 */
export function GradientMesh({ opacity = 0.5, animated = true, className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", animated && "anim-mesh", className)}
      style={{
        opacity,
        backgroundImage: [
          "radial-gradient(circle at 12% 20%, rgb(255 47 164 / 0.22), transparent 45%)",
          "radial-gradient(circle at 88% 18%, rgb(139 61 255 / 0.20), transparent 44%)",
          "radial-gradient(circle at 22% 85%, rgb(255 224 138 / 0.22), transparent 42%)",
          "radial-gradient(circle at 78% 88%, rgb(85 199 255 / 0.18), transparent 44%)",
        ].join(", "),
        backgroundSize: "140% 140%",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
