import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  /**
   * グラデーションのID。ヘッダーとフッターなど同一ページに複数配置されるため、
   * `id` の重複を避ける目的で配置ごとに異なる値を渡します
   * （サルビアのSVGと同じ `uid` 方式です）。
   */
  uid?: string;
};

/**
 * Instagram のカラーアイコン。
 *
 * 公式のブランドカラー（オレンジ→ピンク→パープルのグラデーション）を再現しています。
 */
export function InstagramColorIcon({ className, uid = "default", ...props }: Props) {
  const gid = `rn-ig-${uid}`;

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <defs>
        <radialGradient id={gid} cx="0.3" cy="1.05" r="1.2">
          <stop offset="0%" stopColor="#FFD776" />
          <stop offset="25%" stopColor="#F5983F" />
          <stop offset="50%" stopColor="#E8437F" />
          <stop offset="75%" stopColor="#C32AA3" />
          <stop offset="100%" stopColor="#7638FA" />
        </radialGradient>
      </defs>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill={`url(#${gid})`} />
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="3.6"
        fill="none"
        stroke="#fff"
        strokeWidth={1.7}
      />
      <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth={1.7} />
      <circle cx="16.6" cy="7.4" r="1.05" fill="#fff" />
    </svg>
  );
}
