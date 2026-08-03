import type { ReactNode } from "react";

import { GradientText, type GradientVariant } from "@/components/ui/GradientText";
import { cn } from "@/lib/utils";

type Props = {
  /** 英字の小見出し。装飾目的のため読み上げ対象から外します */
  eyebrow?: string;
  heading: ReactNode;
  lead?: ReactNode;
  /** 見出しレベル。ページ内の階層に合わせて指定します */
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  gradient?: GradientVariant;
  id?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  heading,
  lead,
  as: Tag = "h2",
  align = "center",
  gradient = "signature",
  id,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <p className="font-accent text-[0.7rem] tracking-[0.32em] uppercase" aria-hidden="true">
          <GradientText variant={gradient}>{eyebrow}</GradientText>
        </p>
      ) : null}

      <Tag
        id={id}
        className={cn(
          "text-2xl leading-snug text-balance sm:text-3xl",
          Tag === "h1" && "text-3xl sm:text-4xl lg:text-5xl",
        )}
      >
        {heading}
      </Tag>

      {lead ? (
        <p
          className={cn(
            "text-muted max-w-2xl text-sm leading-relaxed sm:text-base",
            align === "center" && "mx-auto",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
