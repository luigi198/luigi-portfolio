import { NextResponse, type NextRequest } from "next/server";
import { LOCALES } from "@/i18n/config";
import { negotiateLocale } from "@/i18n/negotiate";

function hasLocalePrefix(pathname: string): boolean {
  return LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

/** Sends locale-less URLs (e.g. "/") to the visitor's preferred language. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (hasLocalePrefix(pathname)) return;

  const locale = negotiateLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes and any file with an extension
  // (favicon, robots.txt, sitemap.xml, images).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
