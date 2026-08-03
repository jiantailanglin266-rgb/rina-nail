import type { SVGProps } from "react";

/**
 * X（旧Twitter）のカラーアイコン。
 * 公式のブランドカラーは黒（#000000）で、ロゴは白抜きです。
 */
export function XColorIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#0A0A0A" />
      <path
        d="M16.42 6.2h2.06l-4.5 5.14 5.29 6.99h-4.14l-3.25-4.24-3.71 4.24H6.11l4.81-5.5L5.85 6.2h4.25l2.94 3.88 3.38-3.88Zm-.73 10.9h1.15L9.4 7.38H8.17l7.52 9.72Z"
        fill="#fff"
      />
    </svg>
  );
}
