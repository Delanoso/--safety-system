"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Truck,
  Cog,
  Anchor,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { MAINTENANCE_TYPES } from "@/lib/maintenance-templates";

type Schedule = {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  _count?: { items: number };
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  trucks: <Truck size={28} />,
  machinery: <Cog size={28} />,
  lifting_equipment: <Anchor size={28} />,
  other: <Wrench size={28} />,
};

export default function MaintenanceSchedulePage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/maintenance-schedules");
      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-slate-100 to-indigo-100">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <span />
          <Link
            href="/dashboard"
            className="button button-neutral flex items-center gap-2"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-black">Maintenance Schedule</h1>
          <p className="text-black/70 mt-2">
            Create and manage scheduled maintenance for trucks, machinery, lifting equipment and more.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Create new schedule</h2>
          <p className="text-black/60 mb-6">Choose the type of equipment to add to your maintenance list:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MAINTENANCE_TYPES.map((t) => (
              <Link
                key={t.id}
                href={`/maintenance-schedule/new?type=${t.id}`}
                className="group flex items-center gap-4 p-6 rounded-2xl bg-white/70 backdrop-blur border border-white/40 hover:border-indigo-300 hover:shadow-lg transition"
              >
                <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200">
                  {TYPE_ICONS[t.id] ?? <Wrench size={28} />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-black">{t.label}</h3>
                  <p className="text-sm text-black/60">{t.description}</p>
                </div>
                <ChevronRight className="text-black/40 group-hover:text-indigo-500" size={24} />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-black mb-4">Your schedules</h2>
          {loading ? (
            <p className="text-black/60">Loading...</p>
          ) : schedules.length === 0 ? (
            <div className="rounded-2xl bg-white/60 p-12 text-center text-black/60">
              No schedules yet. Create one above to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => (
                <Link
                  key={s.id}
                  href={`/maintenance-schedule/${s.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/70 border border-white/40 hover:border-indigo-200 hover:shadow transition"
                >
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    {TYPE_ICONS[s.type] ?? <Wrench size={20} />}
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-black">{s.title}</span>
                    <span className="ml-2 text-black/50">
                      ({s._count?.items ?? 0} item{(s._count?.items ?? 0) !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-black/40" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
