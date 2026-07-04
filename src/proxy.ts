import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup"];

/**
 * Runs on Node.js runtime in this Next.js fork (Proxy, not Edge Middleware —
 * see node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
 * next-auth's `auth()` HOF assumes classic Edge Middleware internals and
 * doesn't correctly read the session here, so we decode the JWT directly
 * with `getToken`, which only needs the request + secret and has no such
 * runtime assumption.
 */
export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  // On HTTPS (production) Auth.js prefixes the session cookie with
  // `__Secure-` and uses `authjs.session-token` as the base name (v5).
  // `getToken` defaults to the v4 name `next-auth.session-token`, so
  // without an explicit cookieName it never finds the token in production.
  const secureCookie =
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https";

  const v5CookieName = secureCookie
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
  const v4CookieName = secureCookie
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  // Try v5 name first, then fall back to v4 for compatibility.
  let token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie,
    cookieName: v5CookieName,
  });

  if (!token) {
    token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      secureCookie,
      cookieName: v4CookieName,
    });
  }

  const isLoggedIn = !!token;

  // Signed-in users skip the public pages.
  if (isLoggedIn && (pathname === "/login" || pathname === "/signup" || pathname === "/")) {
    return NextResponse.redirect(new URL("/feed", req.nextUrl));
  }

  // Everything outside the public pages requires a session.
  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|ico|webp)).*)",
  ],
};
