import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;
  const role = req.cookies.get("role")?.value;

  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/api/auth/login",
    "/api/auth/register-company",
    "/api/she-elections/vote",
    "/contractors/upload",
    "/api/contractors/upload-by-token",
  ];

  const isPublic =
    publicRoutes.includes(req.nextUrl.pathname) ||
    req.nextUrl.pathname.startsWith("/api/contractors/by-token/");

  if (isPublic) {
    return NextResponse.next();
  }

  // Block all private routes if not logged in
  if (!session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Example: admin-only routes (allow both admin and super)
  if (
    req.nextUrl.pathname.startsWith("/admin") &&
    role !== "admin" &&
    role !== "super"
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/appointments/:path*",
    "/incidents/:path*",
    "/inspections/:path*",
    "/docs/:path*",
    "/training/:path*",
    "/users/:path*",
    "/api/:path*",
    "/admin/:path*",
    "/she-committee/:path*",
    "/risk-assessments/:path*",
    "/hazardous-chemicals/:path*",
    "/contractors/:path*",
    "/maintenance-schedule/:path*",
  ],
};
