"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

import { galleryCategories, type GalleryCategory, type GalleryItem } from "@/data/gallery";
import { cn } from "@/lib/utils";

type Labels = {
  filterLabel: string;
  all: string;
  categories: Record<GalleryCategory, string>;
  /** "{category}のネイルデザイン例{index}" のようなテンプレート */
  altTemplate: string;
};

type Props = {
  items: GalleryItem[];
  labels: Labels;
};

function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * カテゴリーで絞り込めるギャラリー。
 *
 * 絞り込みは色だけに頼らず、選択中のボタンに aria-pressed を付けて状態を伝えます。
 */
export function GalleryFilter({ items, labels }: Props) {
  const [active, setActive] = useState<GalleryCategory | "all">("all");

  const visible = useMemo(
    () => (active === "all" ? items : items.filter((item) => item.category === active)),
    [active, items],
  );

  const options: Array<GalleryCategory | "all"> = ["all", ...galleryCategories];

  return (
    <div>
      <div role="group" aria-label={labels.filterLabel} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option === active;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setActive(option)}
              aria-pressed={isActive}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-medium transition",
                isActive
                  ? "border-transparent [background-image:var(--gradient-signature)] text-white"
                  : "border-line text-ink hover:border-purple hover:text-purple bg-white",
              )}
            >
              {option === "all" ? labels.all : labels.categories[option]}
            </button>
          );
        })}
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {visible.map((item, index) => {
          const categoryName = labels.categories[item.category];
          return (
            <li key={item.id}>
              <figure className="group bg-soft-pink relative overflow-hidden rounded-2xl">
                <Image
                  src={item.src}
                  alt={interpolate(labels.altTemplate, {
                    category: categoryName,
                    index: index + 1,
                  })}
                  width={item.width}
                  height={item.height}
                  loading={index < 4 ? "eager" : "lazy"}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="h-auto w-full object-cover transition duration-700 ease-[var(--ease-soft)] group-hover:scale-105"
                />
                <figcaption className="text-ink absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 to-transparent px-3 py-2 text-[0.7rem] font-medium">
                  {categoryName}
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
