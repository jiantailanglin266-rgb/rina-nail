export type GoldenSparkleProps = {
  size?: number;
  opacity?: number;
  className?: string;
};

/**
 * ゴールドの光粒。
 *
 * サルビアの合間に少数だけ混ぜ、ネイルのラメのような輝きを添えます。
 * 点滅は使わず、落下と回転のみで見せます（1パス）。
 */
export function GoldenSparkle({ size = 10, opacity = 1, className }: GoldenSparkleProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ opacity, filter: "drop-shadow(0 0 4px rgb(255 224 138 / 0.8))" }}
    >
      <path
        d="M12 0 C13.2 7.4 16.6 10.8 24 12 C16.6 13.2 13.2 16.6 12 24 C10.8 16.6 7.4 13.2 0 12 C7.4 10.8 10.8 7.4 12 0 Z"
        fill="#ffe08a"
      />
    </svg>
  );
}
