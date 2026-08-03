import { ChevronDown } from "lucide-react";

export type FaqItem = { q: string; a: string };

type Props = {
  items: FaqItem[];
  /** 見出しのレベルを揃えるためのタグ */
  headingTag?: "h3" | "h4";
};

/**
 * FAQのアコーディオン。
 *
 * ネイティブの <details> / <summary> を使うため、クライアントJSは不要です。
 * キーボード操作・スクリーンリーダーの開閉状態もブラウザ側が担保します。
 * 回答本文は閉じていてもDOM上に存在するため、検索エンジンと生成AIから読み取れます。
 */
export function FAQAccordion({ items, headingTag: Heading = "h3" }: Props) {
  return (
    <ul className="divide-line glass-card divide-y overflow-hidden rounded-2xl hover:translate-y-0 hover:shadow-[0_18px_40px_-30px_rgba(77,22,125,0.45)]">
      {items.map((item) => (
        <li key={item.q}>
          <details className="group">
            <summary className="hover:bg-soft-pink/60 flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
              <Heading className="text-sm leading-snug font-medium sm:text-base">
                <span aria-hidden="true" className="font-display text-gold mr-2">
                  Q.
                </span>
                {item.q}
              </Heading>
              <ChevronDown
                className="text-purple size-5 shrink-0 transition duration-300 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <p className="text-muted text-sm leading-relaxed">
                <span aria-hidden="true" className="font-display text-hot-pink mr-2">
                  A.
                </span>
                {item.a}
              </p>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
