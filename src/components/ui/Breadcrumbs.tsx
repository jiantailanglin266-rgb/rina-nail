import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  name: string;
  /** 最後の項目（現在地）は href を省略します */
  href?: string;
};

type Props = {
  items: Crumb[];
  label: string;
};

export function Breadcrumbs({ items, label }: Props) {
  return (
    <nav aria-label={label} className="container-page pt-24 pb-2 sm:pt-28">
      <ol className="text-muted flex flex-wrap items-center gap-1 text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.name} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-purple transition">
                  {item.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink">
                  {item.name}
                </span>
              )}
              {!isLast ? <ChevronRight className="text-line size-3" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
