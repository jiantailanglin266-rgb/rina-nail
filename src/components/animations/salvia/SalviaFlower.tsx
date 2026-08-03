import { salviaPalettes, type SalviaVariant } from "@/components/animations/salvia/salviaColors";

export type SalviaFlowerProps = {
  /** 高さ（px） */
  size?: number;
  opacity?: number;
  variant?: SalviaVariant;
  /** 花の向き。right で左右反転します */
  direction?: "left" | "right";
  /** グラデーションIDの衝突を避けるための一意キー */
  uid: string;
  className?: string;
};

/**
 * サルビアの小花（1輪）。
 *
 * サルビアは筒状の花に上下2枚の唇弁がつく形が特徴です。
 * 写実的に描かず、ネイルアートのような繊細さを狙って
 * 4パスの装飾イラストに単純化しています。
 *
 * 装飾のため `aria-hidden` / `focusable="false"` を必ず付けます。
 */
export function SalviaFlower({
  size = 28,
  opacity = 1,
  variant = "red",
  direction = "left",
  uid,
  className,
}: SalviaFlowerProps) {
  const c = salviaPalettes[variant];
  const gid = `salvia-f-${uid}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size * 0.62}
      height={size}
      viewBox="0 0 26 42"
      fill="none"
      className={className}
      style={{
        opacity,
        transform: direction === "right" ? "scaleX(-1)" : undefined,
        // 背景のカラーオーブに埋もれないよう、柔らかい影を落とします
        filter: `drop-shadow(0 2px 4px rgb(77 22 125 / 0.18))`,
      }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={c.deep} />
          <stop offset="55%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.light} />
        </linearGradient>
      </defs>

      {/* 萼（がく）。花のつけ根を締めて形を安定させます */}
      <path
        d="M13 41 C10.4 37.6 9.6 34 10.4 30.4 L16.4 30.4 C17.2 34 16.4 37.6 13 41 Z"
        fill={c.core}
        stroke={c.rim}
        strokeWidth="0.7"
      />

      {/* 花筒と上唇（フード）。先端へ向かって細くなる曲線 */}
      <path
        d="M10.4 30.6 C6.6 24.4 6.2 16.6 10.4 9.8 C12.4 6.4 15.6 4.2 18.4 4.6 C16.4 9.4 15 14.8 15.8 20.4 C16.3 24 15.2 28 13 30.6 Z"
        fill={`url(#${gid})`}
        stroke={c.rim}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* 下唇。横へ開いて花らしさを出します */}
      <path
        d="M15.8 20.6 C19.4 21.4 22.6 23.6 23.8 26.8 C20.4 28.2 16.8 27.4 14.6 24.8 Z"
        fill={c.base}
        stroke={c.rim}
        strokeWidth="0.7"
        strokeLinejoin="round"
      />

      {/* ゴールドの細線。花全体ではなく輪郭の一部だけに乗せます */}
      <path
        d="M11.6 27.4 C9.2 21.6 9.4 15.4 12.6 9.8"
        stroke={c.gold}
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}
