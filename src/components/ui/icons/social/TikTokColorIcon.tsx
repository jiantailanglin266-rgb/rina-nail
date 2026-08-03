import type { SVGProps } from "react";

/**
 * TikTok のカラーアイコン。
 * 公式のブランドカラー（シアン #25F4EE ／ レッド #FE2C55 ／ 黒地に白ロゴ）を再現しています。
 */
export function TikTokColorIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#0A0A0A" />
      {/* シアンとレッドのズレを重ねてTikTokらしい色収差を表現します */}
      <g transform="translate(-0.7 -0.5)">
        <path
          d="M14.6 5.6h1.9c.16 1.42 1.02 2.6 2.5 2.87v1.93c-.96.04-1.87-.2-2.66-.66v4.36a3.9 3.9 0 1 1-3.9-3.9c.2 0 .39.02.58.05v1.98a1.98 1.98 0 1 0 1.4 1.9V5.6Z"
          fill="#25F4EE"
        />
      </g>
      <g transform="translate(0.7 0.5)">
        <path
          d="M14.6 5.6h1.9c.16 1.42 1.02 2.6 2.5 2.87v1.93c-.96.04-1.87-.2-2.66-.66v4.36a3.9 3.9 0 1 1-3.9-3.9c.2 0 .39.02.58.05v1.98a1.98 1.98 0 1 0 1.4 1.9V5.6Z"
          fill="#FE2C55"
        />
      </g>
      <path
        d="M14.6 5.6h1.9c.16 1.42 1.02 2.6 2.5 2.87v1.93c-.96.04-1.87-.2-2.66-.66v4.36a3.9 3.9 0 1 1-3.9-3.9c.2 0 .39.02.58.05v1.98a1.98 1.98 0 1 0 1.4 1.9V5.6Z"
        fill="#fff"
      />
    </svg>
  );
}
