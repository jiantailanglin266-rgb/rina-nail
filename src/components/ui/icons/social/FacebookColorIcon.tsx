import type { SVGProps } from "react";

/**
 * Facebook のカラーアイコン。
 * 公式のブランドカラー（Facebook Blue / #0866FF）を使用しています。
 */
export function FacebookColorIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#0866FF" />
      <path
        d="M15.1 12.6h-1.9v6.4h-2.7v-6.4H9.1v-2.3h1.4V8.9c0-1.87 1.1-2.9 2.8-2.9.82 0 1.68.15 1.68.15v1.85h-.95c-.93 0-1.22.58-1.22 1.17v1.13h2.08l-.33 2.3Z"
        fill="#fff"
      />
    </svg>
  );
}
