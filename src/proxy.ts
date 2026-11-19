import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/config/site";

/**
 * Leitet Aufrufe ohne Sprachpräfix auf die Standardsprache um
 * (z. B. /immobilien → /de/immobilien). Deutsch ist Standard.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Next-Interna und statische Dateien ausnehmen
  matcher: ["/((?!api|_next|images|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
