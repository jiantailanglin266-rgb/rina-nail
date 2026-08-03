import Image from "next/image";

import { Reveal } from "@/components/animations/Reveal";
import type { GalleryItem } from "@/data/gallery";
import { interpolate, type Messages } from "@/i18n/dictionary";
import { cn } from "@/lib/utils";

type Props = {
  items: GalleryItem[];
  messages: Messages;
  className?: string;
  /** 先頭の数枚だけ即時読み込みしたい場合に指定します */
  eagerCount?: number;
};

/**
 * デザインギャラリーのグリッド。
 *
 * alt は「カテゴリー名＋通し番号」で自動生成し、翻訳ファイルの
 * テンプレート（gallery.altTemplate）から言語ごとに組み立てます。
 */
export function GalleryGrid({ items, messages, className, eagerCount = 0 }: Props) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5",
        className,
      )}
    >
      {items.map((item, index) => {
        const categoryName = messages.gallery.categories[item.category];
        const alt = interpolate(messages.gallery.altTemplate, {
          category: categoryName,
          index: index + 1,
        });

        return (
          <Reveal as="li" key={item.id} delay={Math.min(index, 6) * 0.05}>
            <figure className="group bg-soft-pink relative overflow-hidden rounded-2xl">
              <Image
                src={item.src}
                alt={alt}
                width={item.width}
                height={item.height}
                loading={index < eagerCount ? "eager" : "lazy"}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="h-auto w-full object-cover transition duration-700 ease-[var(--ease-soft)] group-hover:scale-105"
              />
              <figcaption className="text-ink absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 to-transparent px-3 py-2 text-[0.7rem] font-medium">
                {categoryName}
              </figcaption>
            </figure>
          </Reveal>
        );
      })}
    </ul>
  );
}
