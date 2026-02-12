"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Plus, Trash2, FileText } from "lucide-react";

type Meeting = {
  id: string;
  date: string;
  agenda: string | null;
  minutes: string | null;
};

export default function SHECommitteeMeetingsPage() {
  const [items, setItems] = useState<Meeting[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/she-meetings");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this meeting record?")) return;
    await fetch(`/api/she-meetings/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <Link href="/she-committee" className="text-black/70 hover:text-black">
            ← SHE Committee
          </Link>
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
            <h1 className="text-4xl font-bold text-black">Committee Meetings</h1>
            <p className="text-black/70">Meeting minutes, agendas and action items.</p>
          </div>
          <Link
            href="/she-committee/meetings/add"
            className="button button-save flex items-center gap-2 w-fit"
          >
            <Plus size={18} />
            Add Meeting
          </Link>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Agenda</th>
                <th className="p-4 font-semibold">Minutes</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-black/60">
                    No meetings yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                items.map((m) => (
                  <tr key={m.id} className="border-b border-black/5 hover:bg-white/40">
                    <td className="p-4 font-medium">
                      {new Date(m.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 max-w-xs truncate">{m.agenda ?? "—"}</td>
                    <td className="p-4 max-w-xs truncate">{m.minutes ?? "—"}</td>
                    <td className="p-4 flex gap-2">
                      <Link
                        href={`/she-committee/meetings/${m.id}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileText size={16} />
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(m.id)}
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
