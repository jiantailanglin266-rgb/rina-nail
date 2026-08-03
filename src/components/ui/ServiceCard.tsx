import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  body: string;
  icon?: ReactNode;
  className?: string;
};

/** サロンの特徴・メリットなどを並べる汎用カード */
export function ServiceCard({ title, body, icon, className }: Props) {
  return (
    <article
      className={cn(
        // ガラス調カード：背景のカラーオーブを透かしつつ、本文のコントラストは保ちます
        "gradient-frame glass-card group h-full rounded-2xl p-6",
        className,
      )}
    >
      {icon ? (
        <div
          aria-hidden="true"
          className="bg-soft-pink text-purple group-hover:bg-soft-lilac mb-4 inline-flex size-11 items-center justify-center rounded-full transition"
        >
          {icon}
        </div>
      ) : null}
      <h3 className="text-base leading-snug sm:text-lg">{title}</h3>
      <p className="text-muted mt-3 text-sm leading-relaxed">{body}</p>
    </article>
  );
}
