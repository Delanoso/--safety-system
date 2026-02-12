"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Plus, Trash2 } from "lucide-react";

type Election = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  _count?: { candidates: number; voters: number };
};

export default function SHEElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);

  useEffect(() => {
    fetch("/api/she-elections")
      .then((r) => r.json())
      .then((data) => setElections(Array.isArray(data) ? data : []))
      .catch(() => setElections([]));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this election? All candidates and votes will be lost.")) return;
    await fetch(`/api/she-elections/${id}`, { method: "DELETE" });
    setElections((prev) => prev.filter((e) => e.id !== id));
  }

  const statusColor = (s: string) => {
    if (s === "voting_open") return "text-green-700 bg-green-100";
    if (s === "voting_closed") return "text-gray-700 bg-gray-200";
    return "text-amber-700 bg-amber-100";
  };

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-4xl mx-auto space-y-10">
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
            <h1 className="text-4xl font-bold text-black">SHE Rep Elections</h1>
            <p className="text-black/70">Create elections, add 2–10 candidates, invite voters, and view results.</p>
          </div>
          <Link
            href="/she-committee/elections/add"
            className="button button-save flex items-center gap-2 w-fit"
          >
            <Plus size={18} />
            New Election
          </Link>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {elections.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-black/60">
                    No elections yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                elections.map((e) => (
                  <tr key={e.id} className="border-b border-black/5 hover:bg-white/40">
                    <td className="p-4 font-medium">
                      <Link href={`/she-committee/elections/${e.id}`} className="hover:underline">
                        {e.title}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${statusColor(e.status)}`}
                      >
                        {e.status === "draft"
                          ? "Draft"
                          : e.status === "voting_open"
                            ? "Voting Open"
                            : "Closed"}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      <Link
                        href={`/she-committee/elections/${e.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Manage
                      </Link>
                      <button
                        onClick={() => handleDelete(e.id)}
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
