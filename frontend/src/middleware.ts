import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "./i18n/config";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return NextResponse.next();
  }
  const accept = req.headers.get("accept-language") ?? "";
  const guessed = locales.find((l) => accept.toLowerCase().startsWith(l)) ?? defaultLocale;
  const url = req.nextUrl.clone();
  url.pathname = `/${guessed}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
