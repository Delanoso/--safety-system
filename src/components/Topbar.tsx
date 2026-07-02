'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, User, Menu, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggle: toggleMobileSidebar } = useMobileSidebar();
  const [notificationCount, setNotificationCount] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setNotificationCount(d?.total ?? 0))
      .catch(() => setNotificationCount(0));
  }, [pathname]);

  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => ({
      name: segment.replace(/-/g, ' '),
      href: '/' + arr.slice(0, index + 1).join('/'),
    }));

  function handleSearch() {
    const term = query.trim();
    if (!term) return;
    // Internal-only search within the app – navigates to dashboard search
    router.push(`/dashboard/search?q=${encodeURIComponent(term)}`);
  }

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) {
      router.push('/dashboard');
      return;
    }
    router.push('/' + segments.slice(0, -1).join('/'));
  }

  const showBack = pathname !== '/dashboard' && pathname.split('/').filter(Boolean).length > 0;

  return (
    <header
      className="w-full min-h-14 h-auto sm:h-16 px-3 sm:px-6 py-2 shadow-sm border-b 
                 bg-[var(--background)] text-[var(--foreground)]
                 border-[var(--foreground)]/20
                 flex flex-wrap items-center justify-between gap-2 min-w-0"
    >
      {/* LEFT: Menu (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 rounded-lg hover:opacity-70 transition shrink-0 lg:hidden
                       bg-[var(--button-neutral-bg)] text-white"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="p-2 -ml-2 rounded-lg hover:opacity-70 transition lg:hidden shrink-0"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <nav className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 min-w-0 truncate">
          <Link href="/dashboard" className="hover:opacity-70 transition shrink-0">
            Home
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1 sm:gap-2 shrink-0">
              /
              <Link
                href={crumb.href}
                className="capitalize hover:opacity-70 transition truncate max-w-[120px] sm:max-w-none"
              >
                {crumb.name}
              </Link>
            </span>
          ))}
        </nav>
      </div>

      {/* CENTER: Search */}
      <div className="flex-1 flex justify-center min-w-0 w-full sm:w-auto order-3 sm:order-2">
        <div className="relative w-full max-w-md sm:w-48 md:w-64 lg:w-1/2">
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            className="w-full rounded-full pl-9 pr-9 py-1.5 sm:py-2 text-sm 
                       bg-[var(--background)] text-[var(--foreground)]
                       border border-[var(--foreground)]/20
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       shadow-sm hover:shadow-md transition"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition"
            aria-label="Search within project"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* RIGHT: Icons */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0 order-2 sm:order-3">
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
                {notificationCount > 99 ? '99+' : notificationCount}
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

