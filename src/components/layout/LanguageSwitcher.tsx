"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";

import { localeNames, locales, type Locale } from "@/i18n/config";
import { saveLocalePreference } from "@/lib/locale-cookie";
import { cn } from "@/lib/utils";

type Props = {
  currentLocale: Locale;
  label: string;
  currentLabel: string;
  className?: string;
};

/**
 * 言語切り替え。
 *
 * 現在のパスのロケール部分だけを置き換えるため、同じページのまま言語を変更できます。
 * 選択した言語は Cookie に保存し、次回「/」へアクセスしたときに proxy.ts が
 * 同じ言語へ振り分けます。
 */
export function LanguageSwitcher({ currentLocale, label, currentLabel, className }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  function pathForLocale(locale: Locale): string {
    const segments = (pathname ?? `/${currentLocale}`).split("/");
    // segments[0] は空文字、segments[1] がロケール
    segments[1] = locale;
    return segments.join("/") || `/${locale}`;
  }

  function selectLocale(locale: Locale) {
    saveLocalePreference(locale);
    setOpen(false);
    router.push(pathForLocale(locale));
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls="language-menu"
        aria-label={label}
        className="border-line text-ink hover:border-purple hover:text-purple inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition"
      >
        <Globe className="size-4" aria-hidden="true" />
        <span>{localeNames[currentLocale]}</span>
      </button>

      {open ? (
        <ul
          id="language-menu"
          className="border-line absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border bg-white py-1 shadow-xl"
        >
          {locales.map((locale) => {
            const isCurrent = locale === currentLocale;
            return (
              <li key={locale}>
                <button
                  type="button"
                  lang={locale}
                  onClick={() => selectLocale(locale)}
                  aria-current={isCurrent ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition",
                    isCurrent ? "text-purple" : "text-ink hover:bg-soft-pink",
                  )}
                >
                  <span>{localeNames[locale]}</span>
                  {isCurrent ? (
                    <>
                      <Check className="size-4 shrink-0" aria-hidden="true" />
                      <span className="sr-only">{currentLabel}</span>
                    </>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
