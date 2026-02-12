import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const HEALTH_PATH = "/api/health";
const SEED_PATH = "/api/seed";

export function middleware(req: NextRequest) {
  // Allow health/seed immediately - no auth, no cookies check
  const rawPath = req.nextUrl.pathname.replace(/\/+$/, "") || "/";
  if (rawPath === HEALTH_PATH || rawPath === SEED_PATH) {
    return NextResponse.next();
  }

  const session = req.cookies.get("session")?.value;
  const role = req.cookies.get("role")?.value;
  const pathname = rawPath;

  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/api/health",
    "/api/seed",
    "/api/auth/login",
    "/api/auth/register-company",
    "/api/she-elections/vote",
    "/contractors/upload",
    "/api/contractors/upload-by-token",
  ];

  const isPublic =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/contractors/by-token/") ||
    pathname.startsWith("/appointments/sign/") ||
    pathname.startsWith("/vote/") ||
    pathname.startsWith("/ppe-management/sign/");

  if (isPublic) {
    return NextResponse.next();
  }

  // Block all private routes if not logged in
  if (!session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Example: admin-only routes (allow both admin and super)
  if (
    pathname.startsWith("/admin") &&
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
    // Match /api/* except /api/health and /api/seed (they bypass middleware entirely)
    /^\/api\/(?!(health|seed)(\/|$))/,
    "/admin/:path*",
    "/she-committee/:path*",
    "/risk-assessments/:path*",
    "/hazardous-chemicals/:path*",
    "/contractors/:path*",
    "/maintenance-schedule/:path*",
    "/medicals/:path*",
    "/ppe-management/:path*",
    "/legal-registers/:path*",
    "/signup",
    "/settings/:path*",
  ],
};
