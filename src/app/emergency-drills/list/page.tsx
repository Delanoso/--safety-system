"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { drillStatusLabel, drillTypeLabel } from "@/lib/emergency-drills";
import { downloadPdf } from "@/lib/pdf-download";

type Drill = {
  id: string;
  drillType: string;
  title: string;
  drillDate: string;
  location: string | null;
  department: string | null;
  coordinator: string | null;
  participantCount: number | null;
  status: string;
};

export default function EmergencyDrillsListPage() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/emergency-drills")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setLoadError(typeof data.error === "string" ? data.error : "Failed to load drills");
          setDrills([]);
          return;
        }
        setDrills(Array.isArray(data) ? data : []);
        setLoadError(null);
      })
      .catch(() => {
        setDrills([]);
        setLoadError("Failed to load emergency drills");
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this emergency drill record?")) return;
    await fetch(`/api/emergency-drills/${id}`, { method: "DELETE" });
    setDrills((prev) => prev.filter((d) => d.id !== id));
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString();
  }

  function statusColor(status: string) {
    if (status === "completed") return "text-green-700";
    if (status === "planned") return "text-orange-600";
    return "text-black/60";
  }

  const filtered = drills.filter((d) => {
    const term = search.toLowerCase();
    return (
      d.title.toLowerCase().includes(term) ||
      drillTypeLabel(d.drillType).toLowerCase().includes(term) ||
      (d.coordinator ?? "").toLowerCase().includes(term) ||
      (d.department ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Emergency Drill Register</h1>
          <div className="flex gap-2">
            <Link href="/emergency-drills/add" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Record Drill
            </Link>
            <Link href="/emergency-drills" className="button button-neutral">Back</Link>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search title, type, coordinator or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
        />

        {loadError && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{loadError}</p>
        )}

        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead>
              <tr className="bg-white/40">
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Title</th>
                <th className="p-3 font-semibold">Coordinator</th>
                <th className="p-3 font-semibold">Participants</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-black/60">No emergency drills found.</td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="border-t border-white/40">
                    <td className="p-3">{formatDate(d.drillDate)}</td>
                    <td className="p-3">{drillTypeLabel(d.drillType)}</td>
                    <td className="p-3">{d.title}</td>
                    <td className="p-3">{d.coordinator ?? "—"}</td>
                    <td className="p-3">{d.participantCount ?? "—"}</td>
                    <td className={`p-3 font-medium ${statusColor(d.status)}`}>{drillStatusLabel(d.status)}</td>
                    <td className="p-3 flex gap-2 flex-wrap">
                      <Link href={`/emergency-drills/${d.id}`} className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View</Link>
                      <button
                        type="button"
                        onClick={() => downloadPdf("emergency-drill", d.id)}
                        className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                      >
                        PDF
                      </button>
                      <button type="button" onClick={() => handleDelete(d.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
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
