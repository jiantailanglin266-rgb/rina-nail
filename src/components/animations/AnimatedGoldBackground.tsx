import { cn } from "@/lib/utils";

type Props = {
  /** full: ヒーロー向けの装飾量、soft: セクション向けの控えめな装飾 */
  density?: "full" | "soft";
  className?: string;
};

/**
 * 背景の金色装飾。
 *
 * すべてCSSアニメーションとインラインSVGで構成し、クライアントJSを使いません
 * （Canvas も未使用）。装飾は `aria-hidden` かつ `pointer-events-none` のため、
 * 読み上げにもクリック操作にも影響しません。
 *
 * - モバイルでは `decor-desktop-only` の要素が非表示になり、描画量が減ります
 * - prefers-reduced-motion 有効時は globals.css 側でアニメーションが停止します
 */
export function AnimatedGoldBackground({ density = "soft", className }: Props) {
  const isFull = density === "full";

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/*
        色の面は ColorfulGradientBackground のカラーオーブが担当します。
        こちらは金色の線と光の粒だけを受け持ち、二重に色を重ねて濁らせないようにします。
      */}

      {/* 金色の細い曲線 */}
      <svg
        className="absolute inset-0 size-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="rn-gold-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFD76A" stopOpacity="0" />
            <stop offset="45%" stopColor="#D4AF37" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FF4FC8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="anim-float"
          d="M-40 620 C 220 470, 380 690, 640 520 S 1040 300, 1260 400"
          stroke="url(#rn-gold-line)"
          strokeWidth="1.2"
        />
        <path
          className="anim-float decor-desktop-only"
          style={{ animationDelay: "-4.5s" }}
          d="M-40 240 C 260 120, 420 330, 700 210 S 1060 90, 1260 180"
          stroke="url(#rn-gold-line)"
          strokeWidth="1"
        />
      </svg>

      {/* ゴールドリング */}
      <div
        className="anim-spin-slow decor-desktop-only absolute top-16 right-[12%] size-40 rounded-full border opacity-40"
        style={{ borderColor: "rgba(212,175,55,0.45)", borderStyle: "dashed" }}
      />
      {isFull ? (
        <div
          className="anim-spin-slow decor-desktop-only absolute bottom-24 left-[8%] size-24 rounded-full border opacity-30"
          style={{
            borderColor: "rgba(255,79,200,0.4)",
            animationDirection: "reverse",
          }}
        />
      ) : null}

      {/* 光の粒・ラメ */}
      {SPARKLES.slice(0, isFull ? SPARKLES.length : 5).map((sparkle, index) => (
        <span
          key={index}
          className={cn("anim-twinkle absolute rounded-full", index > 3 && "decor-desktop-only")}
          style={{
            top: sparkle.top,
            left: sparkle.left,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: sparkle.delay,
            background: sparkle.color,
            boxShadow: `0 0 ${sparkle.size} ${sparkle.color}`,
          }}
        />
      ))}

      {/* 小さく回転する星 */}
      {isFull ? (
        <svg
          className="anim-spin-slow decor-desktop-only absolute top-[38%] left-[6%] size-8 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2 L13.6 9.2 L21 12 L13.6 14.8 L12 22 L10.4 14.8 L3 12 L10.4 9.2 Z"
            fill="#FFD76A"
            fillOpacity="0.75"
          />
        </svg>
      ) : null}
    </div>
  );
}

const SPARKLES = [
  { top: "18%", left: "12%", size: "6px", delay: "0s", color: "rgba(255,215,106,0.9)" },
  { top: "62%", left: "22%", size: "4px", delay: "-1.4s", color: "rgba(255,79,200,0.8)" },
  { top: "30%", left: "78%", size: "5px", delay: "-2.6s", color: "rgba(212,175,55,0.85)" },
  { top: "74%", left: "68%", size: "4px", delay: "-3.1s", color: "rgba(139,61,255,0.7)" },
  { top: "46%", left: "48%", size: "3px", delay: "-0.8s", color: "rgba(255,215,106,0.85)" },
  { top: "12%", left: "56%", size: "5px", delay: "-2.2s", color: "rgba(255,79,200,0.7)" },
  { top: "86%", left: "36%", size: "4px", delay: "-4.2s", color: "rgba(212,175,55,0.8)" },
] as const;
