import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

const variants = {
  goldPink: "text-gradient-gold-pink",
  pinkPurple: "text-gradient-pink-purple",
  purpleGold: "text-gradient-purple-gold",
  neon: "text-gradient-neon",
  signature: "text-gradient-signature",
} as const;

export type GradientVariant = keyof typeof variants;

type Props = {
  children: ReactNode;
  variant?: GradientVariant;
  /** 出力するタグ。見出しの中で使う場合は span のままにしてください */
  as?: ElementType;
  className?: string;
  /** グラデーションをゆっくり動かします */
  animated?: boolean;
};

/**
 * 文字にグラデーションを適用します。
 * 背景クリップで色を抜くため、視認性を保てるよう font-weight を上げています。
 */
export function GradientText({
  children,
  variant = "signature",
  as: Tag = "span",
  className,
  animated = false,
}: Props) {
  return (
    <Tag
      className={cn(
        "text-gradient",
        variants[variant],
        animated && "anim-gradient-move",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
