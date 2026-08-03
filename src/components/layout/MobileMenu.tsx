"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export type MobileNavItem = { href: string; label: string };

type Props = {
  items: MobileNavItem[];
  openLabel: string;
  closeLabel: string;
  menuLabel: string;
  bookingHref: string;
  bookingLabel: string;
};

/** モバイル用のナビゲーション。開閉状態を aria-expanded / aria-controls で伝えます。 */
export function MobileMenu({
  items,
  openLabel,
  closeLabel,
  menuLabel,
  bookingHref,
  bookingLabel,
}: Props) {
  const [open, setOpen] = useState(false);

  // 開いている間は背面のスクロールを止めます
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape で閉じられるようにします
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? closeLabel : openLabel}
        className="border-line text-ink hover:border-purple hover:text-purple inline-flex size-10 items-center justify-center rounded-full border transition lg:hidden"
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-line fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t bg-white/98 backdrop-blur-xl lg:hidden"
      >
        <nav aria-label={menuLabel} className="container-page py-8">
          <ul className="divide-line flex flex-col divide-y">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  // 遷移後にメニューが開いたままにならないよう、クリック時に閉じます
                  onClick={() => setOpen(false)}
                  className="text-ink hover:text-purple block py-4 text-base font-medium transition"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <a
            href={bookingHref}
            className="mt-8 flex w-full items-center justify-center rounded-full [background-image:var(--gradient-signature)] px-6 py-4 text-base font-medium text-white"
            {...(bookingHref.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {bookingLabel}
          </a>
        </nav>
      </div>
    </>
  );
}
