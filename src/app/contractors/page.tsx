"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Plus,
  Trash2,
  ExternalLink,
  FolderOpen,
  Link2,
} from "lucide-react";

type Contractor = {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  scope: string;
  jobDescription: string | null;
  uploadToken: string;
  _count?: { documents: number };
};

export default function ContractorsPage() {
  const [items, setItems] = useState<Contractor[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/contractors");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this contractor and all their documents?")) return;
    const res = await fetch(`/api/contractors/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setItems((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered = items.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.contactEmail?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (c.jobDescription?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-amber-100 to-orange-200">
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
            <h1 className="text-4xl font-bold text-black">Contractors Portal</h1>
            <p className="text-black/70">
              Manage safety files for contractors (specific jobs or ongoing).
            </p>
          </div>
          <Link
            href="/contractors/add"
            className="button button-save flex items-center gap-2 w-fit"
          >
            <Plus size={18} />
            Add Contractor
          </Link>
        </div>

        <input
          type="text"
          placeholder="Search by name, email or job..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md p-3 rounded-xl bg-white/70 border border-white/40"
        />

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="p-4 font-semibold">Company</th>
                <th className="p-4 font-semibold">Scope</th>
                <th className="p-4 font-semibold">Documents</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-black/60">
                    No contractors yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-black/5 hover:bg-white/40"
                  >
                    <td className="p-4 font-medium">{c.name}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          c.scope === "specific_job"
                            ? "bg-amber-200 text-amber-900"
                            : "bg-slate-200 text-slate-800"
                        }`}
                      >
                        {c.scope === "specific_job" ? "Specific Job" : "Ongoing"}
                      </span>
                    </td>
                    <td className="p-4">
                      {c._count?.documents ?? 0} file
                      {(c._count?.documents ?? 0) !== 1 ? "s" : ""}
                    </td>
                    <td className="p-4">
                      {c.contactEmail ?? c.contactPhone ?? "—"}
                    </td>
                    <td className="p-4 flex gap-2">
                      <Link
                        href={`/contractors/${c.id}`}
                        className="button button-neutral flex items-center gap-1 px-3 py-1.5 text-sm"
                        title="View & manage"
                      >
                        <FolderOpen size={14} />
                        Manage
                      </Link>
                      <a
                        href={`/contractors/upload?token=${c.uploadToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        title="Upload link"
                      >
                        <Link2 size={14} />
                        Link
                      </a>
                      <button
                        onClick={() => handleDelete(c.id)}
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
