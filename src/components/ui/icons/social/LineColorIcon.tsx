import type { SVGProps } from "react";

/**
 * LINE のカラーアイコン。
 * 公式のブランドカラー（LINE Green / #06C755）を使用しています。
 */
export function LineColorIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#06C755" />
      {/* 吹き出し */}
      <path
        d="M12 5.6c-4.06 0-7.35 2.63-7.35 5.87 0 2.9 2.61 5.33 6.14 5.79.24.05.56.16.64.36.07.19.05.47.02.66l-.1.62c-.03.18-.15.72.63.39.78-.33 4.22-2.49 5.76-4.26 1.06-1.17 1.61-2.35 1.61-3.56 0-3.24-3.29-5.87-7.35-5.87Z"
        fill="#fff"
      />
      {/* L I N E の文字 */}
      <path
        d="M8.13 9.62v3.02h1.4M10.9 9.62v3.02M12.35 12.64V9.62l2.05 3.02V9.62M16.9 9.62h-1.05v3.02h1.05M15.85 11.13h.95M15.85 9.62h1.05"
        fill="none"
        stroke="#06C755"
        strokeWidth={0.85}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
