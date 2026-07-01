"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { getInspectionDepartment } from "@/lib/inspection-department";

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
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const dept = getInspectionDepartment();
    if (!dept) {
      router.replace("/inspections/select-department");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen w-full p-4 sm:p-6 lg:p-10 flex items-center justify-center">
        <p className="text-base sm:text-lg opacity-80">Loading…</p>
      </div>
    );
  }

  const department = getInspectionDepartment();

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-10 min-w-0">

      {/* DASHBOARD BUTTON */}
      <div className="flex justify-start mb-4 sm:mb-8">
        <Link href="/dashboard" className="button button-neutral flex items-center gap-2 text-sm sm:text-base">
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Inspections</h1>
      <p className="text-sm sm:text-base lg:text-lg opacity-80 mb-6 sm:mb-10">
        {department === "__all__" ? (
          <>Viewing <strong>all departments</strong>. Choose what you want to do with inspections.</>
        ) : (
          <>Department: <strong>{department}</strong>. Choose what you want to do with inspections.</>
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="
              rounded-2xl p-4 sm:p-6 min-h-[10rem] sm:h-48 flex flex-col justify-between
              shadow-xl transition transform hover:scale-[1.03] hover:shadow-2xl
            "
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <div className="text-base sm:text-xl font-semibold">{action.title}</div>
            <div className="text-xs sm:text-sm opacity-90">{action.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

