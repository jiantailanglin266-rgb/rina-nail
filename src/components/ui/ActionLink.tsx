import Link from "next/link";
import type { ReactNode } from "react";

import { isPlaceholder } from "@/data/site";
import { cn } from "@/lib/utils";

const variants = {
  /** 予約CTA。グラデーション塗り＋光沢アニメーション */
  primary:
    "text-white shadow-[0_10px_30px_-12px_rgba(255,47,164,0.65)] [background-image:var(--gradient-signature)] hover:brightness-105",
  /** 副次CTA。白地＋グラデーションの縁 */
  secondary: "gradient-frame bg-white text-ink hover:bg-soft-pink",
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
    "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-wide transition duration-300 ease-[var(--ease-soft)] hover:-translate-y-0.5",
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
