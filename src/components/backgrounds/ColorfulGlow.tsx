import { cn } from "@/lib/utils";

type Props = {
  animated?: boolean;
  className?: string;
};

/**
 * ゴールドの光が斜めに通過する層（第3層）。
 *
 * 幅の広い半透明の帯を 30 秒かけてゆっくり横断させます。
 * 点滅にならないよう、不透明度は 0 → 0.55 → 0 のなだらかな変化に留めています。
 */
export function ColorfulGlow({ animated = true, className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className={cn("absolute -inset-y-1/2 left-0 w-[45%]", animated && "anim-gold-sweep")}
        style={{
          background:
            "linear-gradient(100deg, rgb(255 255 255 / 0) 0%, rgb(255 224 138 / 0.30) 45%, rgb(255 255 255 / 0) 100%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}
