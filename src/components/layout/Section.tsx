import type { ReactNode } from "react";

import { AnimatedGoldBackground } from "@/components/animations/AnimatedGoldBackground";
import { cn } from "@/lib/utils";

const tones = {
  white: "bg-white",
  pink: "bg-soft-pink/50",
  lilac: "bg-soft-lilac/50",
  gold: "bg-soft-gold/60",
} as const;

type Props = {
  children: ReactNode;
  /** セクションごとの背景色。基本はホワイトで、要所のみ淡い色を使います */
  tone?: keyof typeof tones;
  /** 金色の背景装飾を重ねるか */
  decorated?: boolean;
  id?: string;
  className?: string;
  "aria-labelledby"?: string;
};

/** セクション共通のレイアウト（余白を広く取り、圧迫感を出さない） */
export function Section({
  children,
  tone = "white",
  decorated = false,
  id,
  className,
  ...rest
}: Props) {
  return (
    <section
      id={id}
      className={cn("relative overflow-hidden py-16 sm:py-20 lg:py-24", tones[tone], className)}
      {...rest}
    >
      {decorated ? <AnimatedGoldBackground density="soft" /> : null}
      <div className="container-page relative">{children}</div>
    </section>
  );
}
