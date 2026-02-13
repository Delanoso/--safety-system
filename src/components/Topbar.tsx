"use client";

import { useState, useEffect } from "react";
import { Bell, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setNotificationCount(d?.total ?? 0))
      .catch(() => setNotificationCount(0));
  }, [pathname]);

  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, arr) => ({
      name: segment.replace(/-/g, " "),
      href: "/" + arr.slice(0, index + 1).join("/"),
    }));

  return (
    <header
      className="w-full h-16 px-6 shadow-sm border-b 
                 bg-[var(--background)] text-[var(--foreground)]
                 border-[var(--foreground)]/20
                 flex items-center justify-between"
    >
      {/* LEFT: Breadcrumbs */}
      <nav className="text-sm flex items-center gap-2">
        <Link href="/dashboard" className="hover:opacity-70 transition">
          Home
        </Link>

        {breadcrumbs.map((crumb, index) => (
          <span key={index} className="flex items-center gap-2">
            /
            <Link
              href={crumb.href}
              className="capitalize hover:opacity-70 transition"
            >
              {crumb.name}
            </Link>
          </span>
        ))}
      </nav>

      {/* CENTER: Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-1/2">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full pl-10 pr-4 py-2 text-sm 
                       bg-[var(--background)] text-[var(--foreground)]
                       border border-[var(--foreground)]/20
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       shadow-sm hover:shadow-md transition"
          />
          <Search
            size={18}
            className="absolute left-3 top-2.5 opacity-70"
          />
        </div>
      </div>

      {/* RIGHT: Icons */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
        <div className="relative">
          <Link
            href="/dashboard/notifications"
            className="relative inline-flex p-2 rounded-full hover:opacity-70 transition"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1
                           flex items-center justify-center text-[10px] font-bold
                           bg-red-500 text-white rounded-full"
              >
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </Link>
        </div>

        {/* Profile */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 px-3 py-2 rounded-full hover:opacity-70 transition"
        >
          <User size={20} />
          <span className="font-medium hidden md:block">My Profile</span>
        </Link>
      </div>
    </header>
  );
}

