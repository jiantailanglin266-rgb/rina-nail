import type { SVGProps } from "react";

/**
 * YouTube のカラーアイコン。
 * 公式のブランドカラー（YouTube Red / #FF0033）を使用しています。
 */
export function YouTubeColorIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#FF0033" />
      <path d="M10.3 8.9v6.2l5.4-3.1-5.4-3.1Z" fill="#fff" />
    </svg>
  );
}
