"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DashboardData = {
  totalPeople: number;
  totalStockQuantity: number;
  totalStockItems: number;
  lowStockAlerts: { id: number; name: string; quantity: number; minThreshold: number }[];
  pendingSignaturesCount: number;
  issuesTodayCount: number;
  issuesToday: { id: number; quantity: number; person: { name: string }; itemType: { name: string } }[];
  recentMovements: {
    id: number;
    movementType: string;
    quantityDelta: number;
    quantityAfter: number;
    reason: string | null;
    createdAt: string;
    itemType: { name: string };
  }[];
};

function isValidDashboardData(value: unknown): value is DashboardData {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<DashboardData>;
  return (
    typeof v.totalPeople === "number" &&
    typeof v.totalStockQuantity === "number" &&
    typeof v.totalStockItems === "number" &&
    Array.isArray(v.lowStockAlerts) &&
    typeof v.pendingSignaturesCount === "number" &&
    typeof v.issuesTodayCount === "number" &&
    Array.isArray(v.issuesToday) &&
    Array.isArray(v.recentMovements)
  );
}

export default function PPEDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ppe/dashboard")
      .then(async (r) => {
        const text = await r.text();
        if (!text.trim()) return null;
        try {
          return JSON.parse(text) as DashboardData;
        } catch {
          return null;
        }
      })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }

  const d: DashboardData = isValidDashboardData(data)
    ? data
    : {
        totalPeople: 0,
        totalStockQuantity: 0,
        totalStockItems: 0,
        lowStockAlerts: [],
        pendingSignaturesCount: 0,
        issuesTodayCount: 0,
        issuesToday: [],
        recentMovements: [],
      };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-blue-200 to-purple-300 min-w-0">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        {data === null && (
          <div className="rounded-xl bg-amber-100 text-amber-800 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
            Could not load dashboard data. Showing zeros. Check the dashboard API or run database migrations (e.g. <code className="bg-white/50 px-1 rounded">npx prisma db push</code>).
          </div>
        )}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">PPE Dashboard</h1>
            <p className="text-black/70 mt-1 text-sm sm:text-base">Stock, issues and signatures at a glance.</p>
          </div>
          <Link
            href="/ppe-management"
            className="px-3 py-2 sm:px-4 rounded-xl bg-white/60 border border-white/40 text-black font-semibold hover:bg-white/80 transition text-sm sm:text-base shrink-0"
          >
            ← Back to PPE Management
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-semibold text-black/70">Active people</p>
            <p className="text-2xl sm:text-3xl font-bold text-black mt-1">{d.totalPeople}</p>
            <Link href="/ppe-management/size-list" className="text-sm text-blue-700 hover:underline mt-2 inline-block">
              Size list →
            </Link>
          </div>
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-semibold text-black/70">Items in stock</p>
            <p className="text-2xl sm:text-3xl font-bold text-black mt-1">{d.totalStockItems}</p>
            <p className="text-sm text-black/60 mt-1">Total quantity: {d.totalStockQuantity}</p>
            <Link href="/ppe-management/stock-list" className="text-sm text-blue-700 hover:underline mt-2 inline-block">
              Stock list →
            </Link>
          </div>
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-semibold text-black/70">Pending signatures</p>
            <p className="text-2xl sm:text-3xl font-bold text-black mt-1">{d.pendingSignaturesCount}</p>
            <Link href="/ppe-management/issue-register" className="text-sm text-blue-700 hover:underline mt-2 inline-block">
              Issue register →
            </Link>
          </div>
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 sm:p-6">
            <p className="text-xs sm:text-sm font-semibold text-black/70">Issues today</p>
            <p className="text-2xl sm:text-3xl font-bold text-black mt-1">{d.issuesTodayCount}</p>
          </div>
        </div>

        {d.lowStockAlerts.length > 0 && (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-black mb-3">Low stock alerts</h2>
            <p className="text-sm text-black/70 mb-4">Items at or below minimum threshold. Consider reordering.</p>
            <ul className="space-y-2">
              {d.lowStockAlerts.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2 border-b border-white/40 last:border-0">
                  <span className="font-medium text-black">{a.name}</span>
                  <span className="text-amber-700 font-semibold">
                    {a.quantity} in stock (min: {a.minThreshold})
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/ppe-management/stock-list"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700"
            >
              Update stock
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-black mb-3">Issues today</h2>
            {d.issuesToday.length === 0 ? (
              <p className="text-black/60 text-sm">No issues recorded today.</p>
            ) : (
              <ul className="space-y-2">
                {d.issuesToday.map((i) => (
                  <li key={i.id} className="text-sm text-black/80">
                    {i.person.name} – {i.quantity}× {i.itemType.name}
                  </li>
                ))}
              </ul>
            )}
            <Link href="/ppe-management/issue-register" className="text-sm text-blue-700 hover:underline mt-3 inline-block">
              Issue register →
            </Link>
          </div>
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-black mb-3">Recent stock movements</h2>
            {d.recentMovements.length === 0 ? (
              <p className="text-black/60 text-sm">No movements yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {d.recentMovements.slice(0, 10).map((m) => (
                  <li key={m.id} className="flex justify-between text-black/80">
                    <span>
                      {m.itemType.name} – {m.movementType} {m.quantityDelta >= 0 ? "+" : ""}{m.quantityDelta}
                    </span>
                    <span className="text-black/60">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/ppe-management/stock-list#movements" className="text-sm text-blue-700 hover:underline mt-3 inline-block">
              View all →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
