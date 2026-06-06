import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/dashboard", "/admin"];
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("filsbonus_session")?.value;
  const isAuthenticated = Boolean(token);

  if (protectedPaths.some((path) => pathname.startsWith(path)) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authPaths.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
