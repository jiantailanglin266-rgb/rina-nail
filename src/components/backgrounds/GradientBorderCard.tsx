import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  /** 出力するタグ。カード一覧の中では article / li を指定します */
  as?: ElementType;
  /** ホバーで浮かせるか（リンクを持たないカードでは false にします） */
  interactive?: boolean;
  className?: string;
};

/**
 * ガラス調のグラデーションボーダーカード。
 *
 * 半透明の白で背景のカラーオーブを透かしつつ、
 * `backdrop-blur` で背後の色を柔らかくぼかすため、本文のコントラストは保たれます。
 * 縁のグラデーションは `.gradient-frame`（globals.css）が描画します。
 */
export function GradientBorderCard({
  children,
  as: Tag = "div",
  interactive = true,
  className,
}: Props) {
  return (
    <Tag
      className={cn(
        "gradient-frame glass-card rounded-2xl",
        !interactive && "hover:translate-y-0 hover:shadow-[0_18px_40px_-30px_rgba(77,22,125,0.45)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
