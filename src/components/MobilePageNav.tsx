"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

const AUTH_ONLY = ["/", "/login", "/signup"];
const HAS_SHELL = ["/dashboard", "/docs"];
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

export default function MobilePageNav() {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  if (AUTH_ONLY.includes(pathname)) return null;
  if (HAS_SHELL.some((p) => pathname.startsWith(p))) return null;
  if (PUBLIC_SIGN.some((p) => pathname.startsWith(p))) return null;
  if (pathname.startsWith("/pdf-renderer")) return null;

  const parentPath = getParentPath(pathname);

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(parentPath);
  }

  return (
    <nav
      className="sticky top-0 z-40 flex items-center gap-2 px-3 py-2 border-b border-black/10
                 bg-[rgba(255,255,255,0.92)] backdrop-blur-md shadow-sm lg:hidden"
      aria-label="Page navigation"
    >
      <button
        type="button"
        onClick={handleBack}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold
                   bg-[var(--button-neutral-bg)] text-white shrink-0"
      >
        <ArrowLeft size={18} />
        Back
      </button>
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold
                   border border-black/15 bg-white/80 shrink-0"
      >
        <Home size={18} />
        Home
      </Link>
    </nav>
  );
}
