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

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|ico|webp)).*)"],
};
