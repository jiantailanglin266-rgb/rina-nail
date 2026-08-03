import { NextResponse, type NextRequest } from "next/server";

import {
  isLocale,
  localeCookieMaxAge,
  localeCookieName,
  locales,
  matchLocale,
} from "@/i18n/config";

/**
 * ロケールが付いていないURLへのアクセスを、適切な言語へ振り分けます。
 * （Next.js 16 では Middleware が Proxy に名称変更されています）
 *
 * 判定の優先順位:
 *   1. Cookie に保存された言語（言語切り替えUIで選択したもの）
 *   2. Accept-Language ヘッダー
 *   3. 既定（日本語）
 *
 * ロケール付きのページはすべて静的生成されるため、
 * この処理が走るのはロケールなしのURLへアクセスされたときだけです。
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  const locale =
    cookieLocale && isLocale(cookieLocale)
      ? cookieLocale
      : matchLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  // 次回以降は同じ言語へ直接振り分けられるように保存します
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: localeCookieMaxAge,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    /**
     * 静的アセットとメタデータファイルは対象外にします。
     * （_next / 画像 / robots.txt / sitemap.xml / llms.txt など）
     */
    "/((?!_next|api|.*\\..*).*)",
  ],
};
