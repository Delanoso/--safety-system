"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { downloadPdf } from "@/lib/pdf-download";

type Induction = {
  id: number;
  employee: string;
  inductionType: string;
  issueDate: string;
  expiryDate: string | null;
  department: string | null;
  trainer: string | null;
};

export default function InductionTrainingListPage() {
  const [records, setRecords] = useState<Induction[]>([]);
  const [search, setSearch] = useState("");
  const [highlightId, setHighlightId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/induction-training")
      .then(async (res) => {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      })
      .catch(() => setRecords([]));
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;
    const num = parseInt(id, 10);
    if (!Number.isNaN(num)) {
      setHighlightId(num);
      requestAnimationFrame(() => {
        document.getElementById(`induction-row-${num}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [records]);

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this induction record?")) return;
    await fetch(`/api/induction-training/${id}`, { method: "DELETE" });
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  const filtered = records.filter((r) => {
    const term = search.toLowerCase();
    return (
      r.employee.toLowerCase().includes(term) ||
      r.inductionType.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Induction Records</h1>
          <div className="flex gap-2">
            <Link href="/induction-training/add" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Add</Link>
            <Link href="/induction-training" className="button button-neutral">Back</Link>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search employee or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
        />
        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead>
              <tr className="bg-white/40">
                <th className="p-3 font-semibold">Employee</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Expiry</th>
                <th className="p-3 font-semibold">Trainer</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-black/60">No records found.</td></tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    id={`induction-row-${r.id}`}
                    className={`border-t border-white/40 ${highlightId === r.id ? "ring-2 ring-orange-400" : ""}`}
                  >
                    <td className="p-3">{r.employee}</td>
                    <td className="p-3">{r.inductionType}</td>
                    <td className="p-3">{formatDate(r.issueDate)}</td>
                    <td className="p-3">{formatDate(r.expiryDate)}</td>
                    <td className="p-3">{r.trainer ?? "—"}</td>
                    <td className="p-3 flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => downloadPdf("induction-training", r.id)}
                        className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                      >
                        PDF
                      </button>
                      <button type="button" onClick={() => handleDelete(r.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
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
