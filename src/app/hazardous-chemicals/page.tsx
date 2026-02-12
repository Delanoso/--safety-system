"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Plus, Trash2, ExternalLink } from "lucide-react";

type Chemical = {
  id: string;
  name: string;
  casNumber: string | null;
  location: string | null;
  quantity: string | null;
  unit: string | null;
  sdsUrl: string | null;
  hazardClass: string | null;
};

export default function HazardousChemicalsPage() {
  const [items, setItems] = useState<Chemical[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/hazardous-chemicals");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Remove this chemical from the register?")) return;
    await fetch(`/api/hazardous-chemicals/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered = items.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.casNumber?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (c.location?.toLowerCase().includes(search.toLowerCase()) ?? false)
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
            <h1 className="text-4xl font-bold text-black">Hazardous Chemicals Register</h1>
            <p className="text-black/70">Manage chemical inventory and SDS links.</p>
          </div>
          <Link
            href="/hazardous-chemicals/add"
            className="button button-save flex items-center gap-2 w-fit"
          >
            <Plus size={18} />
            Add Chemical
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search by name, CAS number or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-3 rounded-xl bg-white/70 border border-white/40"
        />

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">CAS Number</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Quantity</th>
                <th className="p-4 font-semibold">Hazard Class</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-black/60">
                    No chemicals in register. Add one to get started.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-black/5 hover:bg-white/40">
                    <td className="p-4 font-medium">{c.name}</td>
                    <td className="p-4">{c.casNumber ?? "—"}</td>
                    <td className="p-4">{c.location ?? "—"}</td>
                    <td className="p-4">
                      {c.quantity != null && c.quantity !== ""
                        ? `${c.quantity}${c.unit ? ` ${c.unit}` : ""}`
                        : "—"}
                    </td>
                    <td className="p-4">{c.hazardClass ?? "—"}</td>
                    <td className="p-4 flex gap-2">
                      {c.sdsUrl && (
                        <a
                          href={c.sdsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          title="SDS"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Remove"
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
