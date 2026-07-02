"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

const AUTH_ONLY = ["/", "/login", "/signup"];
const HAS_SHELL = ["/dashboard", "/docs"];
const MODULE_LAYOUT = ["/appointments", "/incidents"];
const PUBLIC_SIGN = [
  "/appointments/sign/",
  "/incidents/sign/",
  "/ppe-management/sign/",
  "/vote/",
];

function getParentPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return "/dashboard";
  return `/${segments.slice(0, -1).join("/")}`;
}

export function shouldShowMobilePageNav(pathname: string): boolean {
  if (AUTH_ONLY.includes(pathname)) return false;
  if (HAS_SHELL.some((p) => pathname.startsWith(p))) return false;
  if (MODULE_LAYOUT.some((p) => pathname.startsWith(p))) return false;
  if (PUBLIC_SIGN.some((p) => pathname.startsWith(p))) return false;
  if (pathname.startsWith("/pdf-renderer")) return false;
  return true;
}

export default function MobilePageNav() {
  const pathname = usePathname() ?? "";

  if (!shouldShowMobilePageNav(pathname)) return null;

  const parentPath = getParentPath(pathname);

  return (
    <nav className="module-mobile-nav" aria-label="Page navigation">
      <Link href={parentPath} className="module-mobile-nav__btn module-mobile-nav__btn--primary">
        <ArrowLeft size={18} aria-hidden />
        Back
      </Link>
      <Link href="/dashboard" className="module-mobile-nav__btn module-mobile-nav__btn--secondary">
        <Home size={18} aria-hidden />
        Home
      </Link>
    </nav>
  );
}
