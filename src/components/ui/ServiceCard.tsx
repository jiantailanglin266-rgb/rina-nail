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
        "gradient-frame group h-full rounded-2xl bg-white p-6 transition duration-300 ease-[var(--ease-soft)]",
        "hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-30px_rgba(139,61,255,0.55)]",
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
