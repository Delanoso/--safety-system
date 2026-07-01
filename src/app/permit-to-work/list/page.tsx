"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { permitTypeLabel, permitStatusLabel } from "@/lib/site-safety";
import { downloadPdf } from "@/lib/pdf-download";

type Permit = {
  id: string;
  permitNumber: string | null;
  permitType: string;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  issuerName: string | null;
  receiverName: string | null;
};

export default function PermitToWorkListPage() {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/permit-to-work")
      .then(async (res) => {
        const data = await res.json();
        setPermits(Array.isArray(data) ? data : []);
      })
      .catch(() => setPermits([]));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this permit?")) return;
    await fetch(`/api/permit-to-work/${id}`, { method: "DELETE" });
    setPermits((prev) => prev.filter((p) => p.id !== id));
  }

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString();
  }

  function statusColor(status: string) {
    if (status === "active" || status === "issued") return "text-green-700";
    if (status === "closed") return "text-black/60";
    if (status === "cancelled") return "text-red-600";
    return "text-orange-600";
  }

  const filtered = permits.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(term) ||
      permitTypeLabel(p.permitType).toLowerCase().includes(term) ||
      (p.permitNumber ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Permits to Work</h1>
          <div className="flex gap-2">
            <Link href="/permit-to-work/add" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Issue Permit</Link>
            <Link href="/permit-to-work" className="button button-neutral">Back</Link>
          </div>
        </div>
        <input type="text" placeholder="Search title, type or permit number..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead>
              <tr className="bg-white/40">
                <th className="p-3 font-semibold">Permit #</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Title</th>
                <th className="p-3 font-semibold">Start</th>
                <th className="p-3 font-semibold">End</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center text-black/60">No permits found.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-t border-white/40">
                    <td className="p-3">{p.permitNumber ?? "—"}</td>
                    <td className="p-3">{permitTypeLabel(p.permitType)}</td>
                    <td className="p-3">{p.title}</td>
                    <td className="p-3">{formatDate(p.startDate)}</td>
                    <td className="p-3">{formatDate(p.endDate)}</td>
                    <td className={`p-3 font-medium ${statusColor(p.status)}`}>{permitStatusLabel(p.status)}</td>
                    <td className="p-3 flex gap-2 flex-wrap">
                      <Link href={`/permit-to-work/${p.id}`} className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View</Link>
                      <button
                        type="button"
                        onClick={() => downloadPdf("permit-to-work", p.id)}
                        className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                      >
                        PDF
                      </button>
                      <button type="button" onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
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
