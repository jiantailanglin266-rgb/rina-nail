import type { Crumb } from "@/components/ui/Breadcrumbs";
import { localeHref, routes, type RouteKey } from "@/data/navigation";
import type { Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/dictionary";
import { absoluteUrl } from "@/lib/seo";
import { breadcrumbJsonLd, type BreadcrumbEntry } from "@/lib/structured-data";

/**
 * 「ホーム > 現在のページ」のパンくずを組み立てます。
 * 画面表示用（Crumb）と構造化データ用（BreadcrumbList）を同じ元データから作るため、
 * 両者の内容が必ず一致します。
 */
export function buildBreadcrumbs(locale: Locale, messages: Messages, routeKey: RouteKey) {
  const entries: BreadcrumbEntry[] = [
    { name: messages.nav.home, url: absoluteUrl(locale, routes.home.path) },
    { name: messages.nav[routeKey], url: absoluteUrl(locale, routes[routeKey].path) },
  ];

  const crumbs: Crumb[] = [
    { name: messages.nav.home, href: localeHref(locale, routes.home.path) },
    { name: messages.nav[routeKey] },
  ];

  return { crumbs, jsonLd: breadcrumbJsonLd(entries) };
}
