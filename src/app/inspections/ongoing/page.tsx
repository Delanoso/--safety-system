"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { getInspectionDepartment } from "@/lib/inspection-department";

type Frequency = "daily" | "weekly" | "monthly";

type BaseInspection = {
  id: string;
  type: string;
  department: string;
  inspectorName: string;
  timestamp: number;
};

type StoredInspections = {
  daily: BaseInspection[];
  weekly: BaseInspection[];
  monthly: BaseInspection[];
};

async function fetchInspections(department: string): Promise<StoredInspections> {
  const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
    fetch(`/api/inspections/list?department=${encodeURIComponent(department)}&frequency=daily`),
    fetch(`/api/inspections/list?department=${encodeURIComponent(department)}&frequency=weekly`),
    fetch(`/api/inspections/list?department=${encodeURIComponent(department)}&frequency=monthly`),
  ]);
  const daily = dailyRes.ok ? await dailyRes.json() : [];
  const weekly = weeklyRes.ok ? await weeklyRes.json() : [];
  const monthly = monthlyRes.ok ? await monthlyRes.json() : [];
  return { daily, weekly, monthly };
}

function Dropdown({
  title,
  items,
  frequency,
  onDelete,
  deletingId,
}: {
  title: string;
  items: BaseInspection[];
  frequency: Frequency;
  onDelete: (id: string, frequency: Frequency) => void;
  deletingId: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl p-4 transition">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-xl font-semibold">{title}</span>
        {open ? <ChevronDown /> : <ChevronRight />}
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-3">
          {items.map((item) => {
            const typeSlug = encodeURIComponent(item.type || "Inspection");
            const href = `/inspections/new/${frequency}/${typeSlug}?id=${item.id}`;

            return (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-white/30 dark:bg-white/5 border border-white/20 hover:bg-white/50 dark:hover:bg-white/10 transition shadow flex items-start justify-between gap-3"
              >
                <Link href={href} className="flex-1 min-w-0">
                  <div className="font-semibold">{item.type || "Inspection"}</div>
                  <div className="text-sm opacity-70">
                    Department: {item.department || "—"}
                  </div>
                  <div className="text-sm opacity-70">
                    Inspector: {item.inspectorName || "—"}
                  </div>
                  <div className="text-sm opacity-70">
                    Created: {new Date(item.timestamp).toLocaleString()}
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm("Delete this inspection? This cannot be undone.")) {
                      onDelete(item.id, frequency);
                    }
                  }}
                  disabled={deletingId === item.id}
                  className="shrink-0 p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition disabled:opacity-50 disabled:pointer-events-none"
                  title="Delete inspection"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OngoingInspectionsPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<StoredInspections>({
    daily: [],
    weekly: [],
    monthly: [],
  });
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const dept = getInspectionDepartment();
    if (!dept) {
      router.replace("/inspections/select-department");
      return;
    }
    fetchInspections(dept)
      .then(setSaved)
      .catch(() => setSaved({ daily: [], weekly: [], monthly: [] }))
      .finally(() => setLoading(false));
  }, [router]);

  const handleDelete = async (id: string, frequency: Frequency) => {
    setDeletingId(id);
    try {
      const res = await fetch(
        `/api/inspections/${encodeURIComponent(id)}?frequency=${frequency}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Delete failed" }));
        alert(err.error || "Failed to delete inspection.");
        return;
      }
      setSaved((prev) => ({
        ...prev,
        [frequency]: prev[frequency].filter((item) => item.id !== id),
      }));
    } catch {
      alert("Failed to delete inspection.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full p-10 flex items-center justify-center">
        <p className="text-lg opacity-80">Loading inspections…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-10 text-black dark:text-white">
      <h1 className="text-4xl font-bold mb-6">Ongoing Inspections</h1>
      <p className="text-lg opacity-80 mb-10">
        Continue inspections that have been created for your department.
      </p>

      <div className="flex flex-col gap-6">
        <Dropdown
          title="Daily Inspections"
          items={saved.daily}
          frequency="daily"
          onDelete={handleDelete}
          deletingId={deletingId}
        />
        <Dropdown
          title="Weekly Inspections"
          items={saved.weekly}
          frequency="weekly"
          onDelete={handleDelete}
          deletingId={deletingId}
        />
        <Dropdown
          title="Monthly Inspections"
          items={saved.monthly}
          frequency="monthly"
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      </div>
    </div>
  );
}

