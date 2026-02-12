"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Plus, Sparkles, Trash2, ExternalLink } from "lucide-react";

type Assessment = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  assessor: string | null;
  riskLevel: string;
  reviewDate: string | null;
  fileUrl: string | null;
  status: string;
};

const RISK_COLORS: Record<string, string> = {
  low: "text-green-700 bg-green-100",
  medium: "text-amber-700 bg-amber-100",
  high: "text-orange-700 bg-orange-100",
  critical: "text-red-700 bg-red-100",
};

export default function RiskAssessmentsPage() {
  const [items, setItems] = useState<Assessment[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/risk-assessments");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this risk assessment?")) return;
    await fetch(`/api/risk-assessments/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  const filtered = items.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.department?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (a.riskLevel?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-6xl mx-auto space-y-10">
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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-black">Risk Assessments</h1>
            <p className="text-black/70">Generate with AI or add manually.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/risk-assessments/generate"
              className="button button-save flex items-center gap-2 w-fit"
            >
              <Sparkles size={18} />
              Generate with AI
            </Link>
            <Link
              href="/risk-assessments/add"
              className="button button-neutral flex items-center gap-2 w-fit"
            >
              <Plus size={18} />
              Add Manually
            </Link>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by title, department or risk level..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-3 rounded-xl bg-white/70 border border-white/40"
        />

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Risk Level</th>
                <th className="p-4 font-semibold">Assessor</th>
                <th className="p-4 font-semibold">Review Date</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-black/60">
                    No risk assessments yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-b border-black/5 hover:bg-white/40">
                    <td className="p-4 font-medium">{a.title}</td>
                    <td className="p-4">{a.department ?? "—"}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          RISK_COLORS[a.riskLevel?.toLowerCase()] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {a.riskLevel}
                      </span>
                    </td>
                    <td className="p-4">{a.assessor ?? "—"}</td>
                    <td className="p-4">
                      {a.reviewDate
                        ? new Date(a.reviewDate).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-4 flex gap-2">
                      <Link
                        href={
                          a.status === "draft"
                            ? `/risk-assessments/${a.id}/edit`
                            : `/risk-assessments/${a.id}`
                        }
                        className="text-blue-600 hover:underline"
                      >
                        {a.status === "draft" ? "Edit" : "View"}
                      </Link>
                      {a.fileUrl && (
                        <a
                          href={a.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
