import Link from "next/link";
import type { ReactNode } from "react";

import { isPlaceholder } from "@/data/site";
import { cn } from "@/lib/utils";

const variants = {
  /**
   * 予約CTA。ネオンピンク → パープル → ゴールドのグラデーション塗り。
   * 背景を 200% 幅にしておき、ホバーで位置を動かして色を変化させます。
   */
  primary: [
    "text-white [background-image:var(--gradient-button)] [background-size:200%_100%] [background-position:0%_50%]",
    "shadow-[0_10px_30px_-12px_rgba(255,47,164,0.65)]",
    "hover:[background-position:100%_50%] hover:shadow-[0_16px_38px_-12px_rgba(139,61,255,0.6)] hover:scale-[1.02]",
  ].join(" "),
  /** 副次CTA。半透明の白地＋グラデーションの縁 */
  secondary: "gradient-frame text-ink bg-white/85 backdrop-blur-md hover:bg-white",
  /** 3番手。下線のみ */
  ghost: "text-purple underline underline-offset-4 hover:text-neon-pink",
} as const;

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[0.95rem]",
  lg: "px-8 py-4 text-base",
} as const;

type Props = {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  /** 外部リンクとして開く（予約サイト・Instagram など） */
  external?: boolean;
  /** CTAを控えめに脈打たせます */
  pulse?: boolean;
  icon?: ReactNode;
  "aria-label"?: string;
};

/**
 * サイト内リンクと外部リンクを同じ見た目で扱うボタン。
 *
 * 予約URLなどが未設定（プレースホルダーのまま）の場合は、
 * リンクを無効化せずに `title` で状態が分かるようにしています。
 * 公開前に `.env.local` で実URLを設定してください。
 */
export function ActionLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  external = false,
  pulse = false,
  icon,
  ...rest
}: Props) {
  const unset = isPlaceholder(href);
  const classes = cn(
    "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-wide transition-all duration-500 ease-[var(--ease-soft)] hover:-translate-y-0.5",
    variants[variant],
    sizes[size],
    variant !== "ghost" && "btn-sheen",
    pulse && "anim-pulse-soft",
    className,
  );

  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );

  if (external || unset) {
    return (
      <a
        href={href}
        className={classes}
        {...(unset ? { title: `未設定のリンクです（${href}）` } : {})}
        {...(external && !unset ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {content}
    </Link>
  );
}
