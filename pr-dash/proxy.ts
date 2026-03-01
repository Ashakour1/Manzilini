import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth_token";
const LOGIN_PATH = "/login";

const protectedPaths = [
  "/",
  "/properties",
  "/applications",
  "/tenants",
  "/staff",
  "/finance",
  "/reports",
];

function isProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return protectedPaths.some((p) => p !== "/" && (pathname === p || pathname.startsWith(`${p}/`)));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (pathname === LOGIN_PATH) {
    if (token) {
      return NextResponse.redirect(new URL("/properties", request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname) && !token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
