import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("agritech_token")?.value;
  const { pathname } = request.nextUrl;

  // Redirect from root
  if (pathname === "/") {
    const redirectUrl = token
      ? new URL("/admin/dashboard", request.url)
      : new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect logged-in users away from /login
  if ((pathname === "/login" || pathname === "/forgot-password") && token) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Protect /admin/* routes
  if (pathname.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/forgot-password"],
};
