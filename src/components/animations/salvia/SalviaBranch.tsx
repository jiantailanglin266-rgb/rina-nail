import { salviaPalettes, type SalviaVariant } from "@/components/animations/salvia/salviaColors";

export type SalviaBranchProps = {
  size?: number;
  opacity?: number;
  variant?: SalviaVariant;
  direction?: "left" | "right";
  uid: string;
  className?: string;
};

/**
 * サルビアの穂（花序）。
 *
 * 細長い小花が縦方向に連なり、先端へ向かって細くなる——
 * サルビアと一目で分かる、この装飾の主役となる形です。
 *
 * 小花は同じ形を縮小・角度違いで並べているだけなので、
 * パス数を抑えたまま自然な揺らぎが出ます。
 */
export function SalviaBranch({
  size = 74,
  opacity = 1,
  variant = "red",
  direction = "left",
  uid,
  className,
}: SalviaBranchProps) {
  const c = salviaPalettes[variant];
  const gid = `salvia-b-${uid}`;

  /** 下から上へ。小さくなりながら左右交互に開きます */
  const florets = [
    { y: 72, scale: 1, tilt: -16 },
    { y: 60, scale: 0.94, tilt: 14 },
    { y: 49, scale: 0.86, tilt: -13 },
    { y: 39, scale: 0.76, tilt: 12 },
    { y: 30, scale: 0.64, tilt: -10 },
    { y: 22, scale: 0.5, tilt: 8 },
  ];

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size * 0.42}
      height={size}
      viewBox="0 0 34 84"
      fill="none"
      className={className}
      style={{
        opacity,
        transform: direction === "right" ? "scaleX(-1)" : undefined,
        filter: "drop-shadow(0 3px 6px rgb(77 22 125 / 0.16))",
      }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={c.deep} />
          <stop offset="60%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.light} />
        </linearGradient>
      </defs>

      {/* 花軸。茎を描き込みすぎると植物図鑑になるため、細い1本だけにします */}
      <path
        d="M17 82 C15.6 66 15.4 44 17 16"
        stroke={c.core}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.6"
      />

      {florets.map((f, i) => (
        <g key={i} transform={`translate(17 ${f.y}) rotate(${f.tilt}) scale(${f.scale})`}>
          {/* 花筒 */}
          <path
            d="M0 0 C-4.6 -3.4 -7.4 -8 -7 -12.6 C-6.6 -16 -4 -18 -1 -17.4 C-1.6 -13 -1 -8.4 1 -4.6 Z"
            fill={`url(#${gid})`}
            stroke={c.rim}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* 下唇 */}
          <path
            d="M1 -4.8 C4.6 -5.2 8 -3.6 9.4 -0.6 C6.4 1 2.8 0.6 0.4 -1.4 Z"
            fill={c.base}
            stroke={c.rim}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
        </g>
      ))}

      {/* 穂先。ゴールドの光を一筋だけ入れて上品さを出します */}
      <path
        d="M17 18 C16.4 14 16.6 11 18 8.6"
        stroke={c.gold}
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}
