import { salviaPalettes, type SalviaVariant } from "@/components/animations/salvia/salviaColors";

export type SalviaPetalProps = {
  size?: number;
  opacity?: number;
  variant?: SalviaVariant;
  uid: string;
  className?: string;
};

/**
 * サルビアの花びら1枚。
 *
 * 花本体より軽く速く舞わせるため、2パスまで削っています。
 * 数を出す要素なので、ここを軽くしておくことが全体の描画コストに効きます。
 */
export function SalviaPetal({
  size = 14,
  opacity = 1,
  variant = "pink",
  uid,
  className,
}: SalviaPetalProps) {
  const c = salviaPalettes[variant];
  const gid = `salvia-p-${uid}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size * 0.7}
      height={size}
      viewBox="0 0 14 20"
      fill="none"
      className={className}
      style={{ opacity, filter: "drop-shadow(0 1px 3px rgb(77 22 125 / 0.16))" }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={c.deep} />
          <stop offset="100%" stopColor={c.light} />
        </linearGradient>
      </defs>

      <path
        d="M7 19.4 C2.4 15.4 0.4 9.6 2 4.6 C3 1.6 5.6 0 8 1 C11.4 2.4 13.4 6.6 12.6 11 C12 14.6 9.8 17.8 7 19.4 Z"
        fill={`url(#${gid})`}
        stroke={c.rim}
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* 中央の筋。1本だけでも花びららしく見えます */}
      <path
        d="M7 18 C5.6 13.4 5.6 8 7.4 3.4"
        stroke={c.core}
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
