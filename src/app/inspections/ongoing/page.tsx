"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

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

function loadInspections(): StoredInspections {
  try {
    const raw = localStorage.getItem("inspections");
    if (!raw) return { daily: [], weekly: [], monthly: [] };
    const parsed = JSON.parse(raw);
    return {
      daily: parsed.daily ?? [],
      weekly: parsed.weekly ?? [],
      monthly: parsed.monthly ?? [],
    };
  } catch {
    return { daily: [], weekly: [], monthly: [] };
  }
}

function Dropdown({
  title,
  items,
  frequency,
}: {
  title: string;
  items: BaseInspection[];
  frequency: Frequency;
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
            const href = `/inspections/new/${frequency}/${encodeURIComponent(
              item.type
            )}?id=${item.id}`;

            return (
              <Link
                key={item.id}
                href={href}
                className="p-3 rounded-xl bg-white/30 dark:bg-white/5 border border-white/20 hover:bg-white/50 dark:hover:bg-white/10 transition shadow"
              >
                <div className="font-semibold">{item.type}</div>

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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OngoingInspectionsPage() {
  const [saved, setSaved] = useState<StoredInspections>({
    daily: [],
    weekly: [],
    monthly: [],
  });

  useEffect(() => {
    setSaved(loadInspections());
  }, []);

  return (
    <div className="min-h-screen w-full p-10 text-black dark:text-white">
      <h1 className="text-4xl font-bold mb-6">Ongoing Inspections</h1>
      <p className="text-lg opacity-80 mb-10">
        Continue inspections that have been created.
      </p>

      <div className="flex flex-col gap-6">
        <Dropdown
          title="Daily Inspections"
          items={saved.daily}
          frequency="daily"
        />
        <Dropdown
          title="Weekly Inspections"
          items={saved.weekly}
          frequency="weekly"
        />
        <Dropdown
          title="Monthly Inspections"
          items={saved.monthly}
          frequency="monthly"
        />
      </div>
    </div>
  );
}

