"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { downloadPdf } from "@/lib/pdf-download";

import { isAttendeeSigned } from "@/lib/toolbox-talk-attendees";

type Attendee = { id: string; name: string; signature?: string | null };
type ToolboxTalk = {
  id: string;
  title: string;
  topic: string | null;
  presenter: string | null;
  department: string | null;
  location: string | null;
  talkDate: string;
  attendees: Attendee[];
};

export default function ToolboxTalksListPage() {
  const [talks, setTalks] = useState<ToolboxTalk[]>([]);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/toolbox-talks")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setLoadError(typeof data.error === "string" ? data.error : "Failed to load toolbox talks");
          setTalks([]);
          return;
        }
        setTalks(Array.isArray(data) ? data : []);
        setLoadError(null);
      })
      .catch(() => {
        setTalks([]);
        setLoadError("Failed to load toolbox talks");
      });
  }, []);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this toolbox talk?")) return;
    await fetch(`/api/toolbox-talks/${id}`, { method: "DELETE" });
    setTalks((prev) => prev.filter((t) => t.id !== id));
  }

  const filtered = talks.filter((t) => {
    const term = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      (t.topic ?? "").toLowerCase().includes(term) ||
      (t.presenter ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Toolbox Talks</h1>
          <div className="flex gap-2">
            <Link href="/toolbox-talks/add" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
              Add
            </Link>
            <Link href="/toolbox-talks" className="button button-neutral">
              Back
            </Link>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by title, topic or presenter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
        />

        {loadError && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {loadError}
          </p>
        )}

        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
          <table className="w-full text-left text-sm min-w-[640px]">
            <thead>
              <tr className="bg-white/40">
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Title</th>
                <th className="p-3 font-semibold">Topic</th>
                <th className="p-3 font-semibold">Presenter</th>
                <th className="p-3 font-semibold">Signed</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-black/60">
                    No toolbox talks found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-t border-white/40">
                    <td className="p-3">{formatDate(t.talkDate)}</td>
                    <td className="p-3">{t.title}</td>
                    <td className="p-3">{t.topic ?? "—"}</td>
                    <td className="p-3">{t.presenter ?? "—"}</td>
                    <td className="p-3">
                      {(() => {
                        const total = t.attendees?.length ?? 0;
                        const signed = (t.attendees ?? []).filter((a) =>
                          isAttendeeSigned(a)
                        ).length;
                        if (total === 0) return "—";
                        return (
                          <span
                            className={
                              signed === total
                                ? "text-green-700 font-medium"
                                : signed === 0
                                  ? "text-orange-600 font-medium"
                                  : "text-black/80"
                            }
                          >
                            {signed}/{total}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-3 flex gap-2 flex-wrap">
                      <Link
                        href={`/toolbox-talks/${t.id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => downloadPdf("toolbox-talk", t.id)}
                        className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Delete
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
