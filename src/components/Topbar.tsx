"use client";

import { useState, useEffect } from "react";
import { Bell, Search, User, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Topbar() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, arr) => ({
      name: segment.replace(/-/g, " "),
      href: "/" + arr.slice(0, index + 1).join("/"),
    }));

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

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

        {/* Dark Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:opacity-70 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:opacity-70 transition">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-full hover:opacity-70 transition"
          >
            <User size={20} />
            <span className="font-medium hidden md:block">Profile</span>
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg py-2
                         bg-[var(--background)] text-[var(--foreground)]
                         border border-[var(--foreground)]/20"
            >
              <Link
                href="/profile"
                className="block px-4 py-2 text-sm hover:opacity-70 transition"
              >
                My Profile
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 text-sm hover:opacity-70 transition"
              >
                Settings
              </Link>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:opacity-70 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

