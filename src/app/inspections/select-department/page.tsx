"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { setInspectionDepartment } from "@/lib/inspection-department";

export default function SelectDepartmentPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { user?: { inspectionDepartments?: string[] | null } }) => {
        const list = data?.user?.inspectionDepartments ?? [];
        setDepartments(Array.isArray(list) ? list : []);
      })
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && departments.length === 0) {
      setInspectionDepartment("__all__");
      router.replace("/inspections");
      return;
    }
    if (loading || departments.length !== 1) return;
    const only = departments[0];
    if (only) {
      setInspectionDepartment(only);
      router.replace("/inspections");
    }
  }, [loading, departments, router]);

  const selectDepartment = (dept: string) => {
    setInspectionDepartment(dept);
    router.push("/inspections");
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full p-4 sm:p-6 lg:p-10 flex items-center justify-center">
        <p className="text-base sm:text-lg opacity-80">Loading…</p>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="min-h-screen w-full p-4 sm:p-6 lg:p-10 flex items-center justify-center">
        <p className="text-base sm:text-lg opacity-80">Redirecting to inspections…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-10 min-w-0">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="button button-neutral flex items-center gap-2 mb-4 sm:mb-8 w-fit text-sm sm:text-base">
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Inspections</h1>
        <p className="text-sm sm:text-base lg:text-lg opacity-80 mb-6 sm:mb-10">
          Choose a department to view and manage inspections.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => selectDepartment(dept)}
              className="
                rounded-2xl p-4 sm:p-6 text-left
                shadow-xl transition transform hover:scale-[1.02] hover:shadow-2xl
              "
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
              }}
            >
              <div className="text-base sm:text-xl font-semibold">{dept}</div>
              <div className="text-xs sm:text-sm opacity-80 mt-1">View and edit inspections for this department</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
