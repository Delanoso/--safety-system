import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const role = req.cookies.get("role")?.value;

  const publicRoutes = ["/", "/login", "/api/auth/login"];

  // Allow public routes
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Block all private routes if not logged in
  if (!session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Example: admin-only routes
  if (req.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/appointments/:path*",
    "/admin/:path*",
  ],
};
