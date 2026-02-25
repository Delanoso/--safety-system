"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

type Issue = {
  id: number;
  personId: number;
  itemTypeId: number;
  quantity: number;
  issueDate: string;
  status: string;
  person: { name: string; department: string | null };
  itemType: { name: string };
};

type Movement = {
  id: number;
  movementType: string;
  quantityDelta: number;
  quantityAfter: number;
  reason: string | null;
  createdAt: string;
  itemType: { name: string };
};

export default function PPEReportsPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "signed">("all");
  const [tab, setTab] = useState<"issues" | "movements">("issues");

  useEffect(() => {
    async function load() {
      try {
        const [issuesRes, movementsRes] = await Promise.all([
          fetch("/api/ppe/issues"),
          fetch("/api/ppe/stock/movements?limit=500"),
        ]);
        const parse = async (r: Response): Promise<unknown> => {
          const text = await r.text();
          if (!text.trim()) return [];
          try {
            return JSON.parse(text);
          } catch {
            return [];
          }
        };
        const [iRaw, mRaw] = await Promise.all([parse(issuesRes), parse(movementsRes)]);
        setIssues(Array.isArray(iRaw) ? iRaw : []);
        setMovements(Array.isArray(mRaw) ? mRaw : []);
      } catch {
        setIssues([]);
        setMovements([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredIssues =
    filter === "all"
      ? issues
      : filter === "pending"
        ? issues.filter((x) => x.status === "pending_signature")
        : issues.filter((x) => x.status === "signed");

  function exportIssuesExcel() {
    const rows = [
      ["Date", "Person", "Department", "Item", "Quantity", "Status"],
      ...filteredIssues.map((i) => [
        new Date(i.issueDate).toLocaleString(),
        i.person.name,
        i.person.department ?? "",
        i.itemType.name,
        i.quantity,
        i.status,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PPE Issues");
    XLSX.writeFile(wb, "ppe-issues-report.xlsx");
  }

  function exportMovementsExcel() {
    const rows = [
      ["Date", "Item", "Type", "Change", "Quantity after", "Reason"],
      ...movements.map((m) => [
        new Date(m.createdAt).toLocaleString(),
        m.itemType.name,
        m.movementType,
        m.quantityDelta,
        m.quantityAfter,
        m.reason ?? "",
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Movements");
    XLSX.writeFile(wb, "ppe-stock-movements.xlsx");
  }

  if (loading) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-black">PPE Reports</h1>
            <p className="text-black/70 mt-1">View and export issues and stock movements.</p>
          </div>
          <Link
            href="/ppe-management"
            className="px-4 py-2 rounded-xl bg-white/60 border border-white/40 text-black font-semibold hover:bg-white/80 transition"
          >
            ← Back to PPE Management
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("issues")}
            className={`px-4 py-2 rounded-xl font-semibold transition ${tab === "issues" ? "bg-blue-600 text-white" : "bg-white/60 text-black border border-white/40"}`}
          >
            Issues
          </button>
          <button
            type="button"
            onClick={() => setTab("movements")}
            className={`px-4 py-2 rounded-xl font-semibold transition ${tab === "movements" ? "bg-blue-600 text-white" : "bg-white/60 text-black border border-white/40"}`}
          >
            Stock movements
          </button>
        </div>

        {tab === "issues" && (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
            <div className="p-4 bg-white/40 flex flex-wrap items-center gap-4">
              <span className="font-semibold text-black">Filter:</span>
              {(["all", "pending", "signed"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${filter === f ? "bg-blue-600 text-white" : "bg-white/70 text-black"}`}
                >
                  {f === "all" ? "All" : f === "pending" ? "Pending signature" : "Signed"}
                </button>
              ))}
              <button
                type="button"
                onClick={exportIssuesExcel}
                className="ml-auto px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              >
                Export to Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/40">
                    <th className="p-4 font-semibold text-black">Date</th>
                    <th className="p-4 font-semibold text-black">Person</th>
                    <th className="p-4 font-semibold text-black">Department</th>
                    <th className="p-4 font-semibold text-black">Item</th>
                    <th className="p-4 font-semibold text-black">Qty</th>
                    <th className="p-4 font-semibold text-black">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-black/60">
                        No issues match the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredIssues.map((i) => (
                      <tr key={i.id} className="border-t border-white/40">
                        <td className="p-4 text-black/80">{new Date(i.issueDate).toLocaleString()}</td>
                        <td className="p-4 text-black/80">{i.person.name}</td>
                        <td className="p-4 text-black/80">{i.person.department ?? "—"}</td>
                        <td className="p-4 text-black/80">{i.itemType.name}</td>
                        <td className="p-4 text-black/80">{i.quantity}</td>
                        <td className="p-4">
                          <span className={i.status === "signed" ? "text-green-700 font-medium" : "text-amber-700"}>
                            {i.status === "signed" ? "Signed" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "movements" && (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
            <div className="p-4 bg-white/40 flex justify-end">
              <button
                type="button"
                onClick={exportMovementsExcel}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
              >
                Export to Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/40">
                    <th className="p-4 font-semibold text-black">Date</th>
                    <th className="p-4 font-semibold text-black">Item</th>
                    <th className="p-4 font-semibold text-black">Type</th>
                    <th className="p-4 font-semibold text-black">Change</th>
                    <th className="p-4 font-semibold text-black">After</th>
                    <th className="p-4 font-semibold text-black">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-black/60">
                        No stock movements yet.
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id} className="border-t border-white/40">
                        <td className="p-4 text-black/80">{new Date(m.createdAt).toLocaleString()}</td>
                        <td className="p-4 text-black/80">{m.itemType.name}</td>
                        <td className="p-4 text-black/80">{m.movementType}</td>
                        <td className="p-4">{m.quantityDelta >= 0 ? `+${m.quantityDelta}` : m.quantityDelta}</td>
                        <td className="p-4 text-black/80">{m.quantityAfter}</td>
                        <td className="p-4 text-black/60">{m.reason ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
