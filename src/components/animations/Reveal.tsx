"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** 入ってくる方向 */
  direction?: "up" | "left" | "right" | "none";
  /** 秒単位の遅延。カードを順番に出したいときに使います */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
};

const offsets = {
  up: { x: 0, y: 28 },
  left: { x: -32, y: 0 },
  right: { x: 32, y: 0 },
  none: { x: 0, y: 0 },
} as const;

/**
 * スクロールで一度だけフェードインさせるラッパー。
 * prefers-reduced-motion が有効な場合は、アニメーションせずに即表示します。
 */
export function Reveal({ children, direction = "up", delay = 0, className, as = "div" }: Props) {
  const reduceMotion = useReducedMotion();
  const offset = offsets[direction];
  const MotionTag = motion[as];

  if (reduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      // JavaScript が無効・読み込み失敗の場合でも中身が見えるよう、
      // layout.tsx の <noscript> スタイルからこの属性を対象に打ち消します
      data-reveal=""
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
