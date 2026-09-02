import { NextRequest, NextResponse } from "next/server";

/**
 * Proteksi ringan di edge: hanya cek keberadaan cookie session (tanpa verify
 * signature — verifikasi penuh tetap dilakukan di server component/route
 * lewat requireAuth()). Middleware ini murni untuk UX redirect cepat.
 */
const PUBLIC_PATHS = ["/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const hasSession = req.cookies.has("cis_session");
  if (!hasSession && pathname !== "/") {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
