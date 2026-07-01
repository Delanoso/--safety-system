"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HardHat, LayoutDashboard } from "lucide-react";

const MODULES = [
  {
    title: "Toolbox Talks",
    description: "Record safety briefings, topics, presenters and attendees.",
    route: "/toolbox-talks",
  },
  {
    title: "Induction Training",
    description: "Track site and department inductions for employees and contractors.",
    route: "/induction-training",
  },
  {
    title: "Visitor Register",
    description: "Sign visitors in and out with host, purpose and contact details.",
    route: "/visitor-register",
  },
  {
    title: "Permit to Work",
    description: "Issue and manage permits for hot work, height, confined space and more.",
    route: "/permit-to-work",
  },
];

export default function SiteSafetyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
        <div className="flex justify-start">
          <Link href="/dashboard" className="button button-neutral flex items-center gap-2">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <HardHat className="text-orange-800" size={36} />
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-black">Site Safety</h1>
            <p className="text-black/70 text-sm sm:text-base mt-1">
              Day-to-day safety activities on site.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {MODULES.map((item) => (
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
