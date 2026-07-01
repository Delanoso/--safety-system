"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

export default function ToolboxTalksPage() {
  const router = useRouter();

  const items = [
    {
      title: "Record Toolbox Talk",
      description: "Log a safety briefing with topic, presenter and attendees.",
      route: "/toolbox-talks/add",
    },
    {
      title: "View All Toolbox Talks",
      description: "Browse and search recorded toolbox talks.",
      route: "/toolbox-talks/list",
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
        <div className="flex flex-wrap gap-2">
          <Link href="/site-safety" className="button button-neutral">
            Site Safety
          </Link>
          <Link href="/dashboard" className="button button-neutral flex items-center gap-2">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-black">Toolbox Talks</h1>
        <p className="text-black/70">Record safety briefings and attendee registers.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {items.map((item) => (
            <button
              key={item.route}
              type="button"
              onClick={() => router.push(item.route)}
              className="text-left p-5 sm:p-6 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 hover:bg-white/80 transition"
            >
              <h2 className="text-lg sm:text-xl font-bold text-black mb-2">{item.title}</h2>
              <p className="text-black/70 text-sm">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
