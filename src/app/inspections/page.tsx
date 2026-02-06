"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

const actions = [
  {
    title: "Create New Inspection",
    description: "Start a new inspection by selecting the type and capturing the details.",
    href: "/inspections/new",
  },
  {
    title: "Ongoing Inspections",
    description: "View inspections currently in progress and update their status.",
    href: "/inspections/ongoing",
  },
  {
    title: "Non-Conformance Report",
    description: "Review and document any non-conformances identified during inspections.",
    href: "/inspections/non-conformance",
  },
];

export default function InspectionsHome() {
  return (
    <div className="min-h-screen w-full p-10">

      {/* DASHBOARD BUTTON */}
      <div className="flex justify-start mb-8">
        <Link href="/dashboard" className="button button-neutral flex items-center gap-2">
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-6">Inspections</h1>
      <p className="text-lg opacity-80 mb-10">
        Choose what you want to do with inspections.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="
              rounded-2xl p-6 h-48 flex flex-col justify-between
              shadow-xl transition transform hover:scale-[1.03] hover:shadow-2xl
            "
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <div className="text-xl font-semibold">{action.title}</div>
            <div className="text-sm opacity-90">{action.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

