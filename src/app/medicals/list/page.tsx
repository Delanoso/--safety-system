"use client";

import { useEffect, useState } from "react";

type Medical = {
  id: number;
  employee: string;
  medicalType: string;
  issueDate: string;
  expiryDate: string;
  notes: string | null;
  fileUrl: string | null;
  createdAt: string;
};

export default function MedicalsListPage() {
  const [medicals, setMedicals] = useState<Medical[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/medicals");
      const data = await res.json();
      setMedicals(data);
    }
    load();
  }, []);

  function formatDate(dateString: string) {
    return new Date(dateString).toISOString().split("T")[0];
  }

  function daysUntil(date: string) {
    const now = new Date();
    const target = new Date(date);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  function getStatus(expiry: string) {
    const days = daysUntil(expiry);
    if (days < 0) return { label: "Expired", color: "text-red-700" };
    if (days <= 30) return { label: "Expiring Soon", color: "text-red-500" };
    if (days <= 60) return { label: "Warning", color: "text-orange-500" };
    return { label: "Valid", color: "text-green-600" };
  }

  async function handleDelete(id: number) {
    await fetch(`/api/medicals/${id}`, { method: "DELETE" });
    setMedicals((prev) => prev.filter((m) => m.id !== id));
  }

  function handleDownloadPdf(m: Medical) {
    const id = m.id != null ? String(m.id) : "";
    if (!id) return;
    window.open(`/api/pdf?type=medical-certificate&id=${encodeURIComponent(id)}`, "_blank");
  }

  const filtered = medicals.filter((m) => {
    const term = search.toLowerCase();
    return (
      m.employee.toLowerCase().includes(term) ||
      m.medicalType.toLowerCase().includes(term)
    );
  });

  const isPDF = (url: string | null) =>
    url && url.toLowerCase().includes(".pdf");

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-black">All Medicals</h1>
        <p className="text-black/70">Browse, filter and manage all medical records.</p>

        <input
          type="text"
          placeholder="Search by employee or medical type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
        />

        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/40">
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Medical Type</th>
                <th className="p-4 font-semibold">Issue Date</th>
                <th className="p-4 font-semibold">Expiry Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>

            {filtered.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={6} className="p-4 text-center text-black/60">
                    No medicals found.
                  </td>
                </tr>
              </tbody>
            )}

            {filtered.map((m) => {
              const status = getStatus(m.expiryDate);
              return (
                <tbody key={m.id}>
                  <tr className="border-t border-white/40">
                    <td className="p-4">{m.employee}</td>
                    <td className="p-4">{m.medicalType}</td>
                    <td className="p-4">{formatDate(m.issueDate)}</td>
                    <td className="p-4">{formatDate(m.expiryDate)}</td>
                    <td className={`p-4 font-semibold ${status.color}`}>
                      {status.label}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => handleDownloadPdf(m)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => setExpandedId((prev) => (prev === m.id ? null : m.id))}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {expandedId === m.id ? "Hide" : "View"}
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {expandedId === m.id && (
                    <tr className="bg-white/30 backdrop-blur-xl border-t border-white/40">
                      <td colSpan={6} className="p-6">
                        <div className="rounded-xl overflow-hidden shadow-lg bg-white/70 p-4">
                          {!m.fileUrl ? (
                            <p className="text-black/70 py-8 text-center">
                              No document uploaded for this medical.
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-black/60 mb-2">
                                <a
                                  href={m.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Open document in new tab
                                </a>
                              </p>
                              {isPDF(m.fileUrl) ? (
                                <iframe
                                  src={m.fileUrl}
                                  className="w-full h-[600px] rounded-xl border border-white/40"
                                  title="Medical document"
                                />
                              ) : (
                                <img
                                  src={m.fileUrl}
                                  alt="Medical document"
                                  className="w-full max-h-[600px] object-contain rounded-xl border border-white/40"
                                />
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
          </table>
        </div>
      </div>
    </div>
  );
}
