import type { SVGProps } from "react";

/**
 * Instagram のブランドアイコン。
 * lucide-react はブランドアイコンを収録していないため、自前のインラインSVGを使います。
 * 装飾要素のため、既定で aria-hidden を付けています。
 */
export function InstagramIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
