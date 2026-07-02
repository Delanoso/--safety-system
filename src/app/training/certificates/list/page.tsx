"use client";

import { useEffect, useState } from "react";
import { downloadPdf } from "@/lib/pdf-download";

export default function CertificatesListPage() {
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/certificates");
      const data = await res.json();
      setCertificates(data);
    }
    load();
  }, []);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;
    const num = parseInt(id, 10);
    if (!Number.isNaN(num)) {
      setExpandedId(num);
      requestAnimationFrame(() => {
        document.getElementById(`cert-row-${num}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, []);

  function formatDate(dateString) {
    return new Date(dateString).toISOString().split("T")[0];
  }

  function daysUntil(date: string | Date): number {
    const now = new Date();
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function getStatus(expiry) {
    const days = daysUntil(expiry);

    if (days < 0) return { label: "Expired", color: "text-red-700" };
    if (days <= 30) return { label: "Expiring Soon", color: "text-red-500" };
    if (days <= 60) return { label: "Warning", color: "text-orange-500" };
    return { label: "Valid", color: "text-green-600" };
  }

  async function handleDelete(id) {
    await fetch(`/api/certificates/${id}`, {
      method: "DELETE",
    });

    setCertificates((prev) => prev.filter((c) => c.id !== id));
  }

  function handleDownloadPdf(c) {
    const id = c.id != null ? String(c.id) : "";
    if (!id) return;
    downloadPdf("training-certificate", id);
  }

  const filtered = certificates.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.employee.toLowerCase().includes(term) ||
      c.certificateName.toLowerCase().includes(term) ||
      (c.certificateType || "").toLowerCase().includes(term)
    );
  });

  function toggleExpand(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-blue-200 to-purple-300 min-w-0">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">All Certificates</h1>
        <p className="text-black/70 text-sm sm:text-base">Browse, filter and manage all certificates.</p>

        <input
          type="text"
          placeholder="Search by employee, certificate or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2.5 sm:p-3 rounded-lg border border-white/40 bg-white/70 text-sm sm:text-base"
        />

        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 min-w-0">
          <table className="w-full text-left min-w-[640px] sm:min-w-0 text-xs sm:text-sm">
            <thead>
              <tr className="bg-white/40">
                <th className="p-2 sm:p-4 font-semibold">Employee</th>
                <th className="p-2 sm:p-4 font-semibold">Certificate</th>
                <th className="p-2 sm:p-4 font-semibold">Type</th>
                <th className="p-2 sm:p-4 font-semibold">Issue Date</th>
                <th className="p-2 sm:p-4 font-semibold">Expiry Date</th>
                <th className="p-2 sm:p-4 font-semibold">Status</th>
                <th className="p-2 sm:p-4 font-semibold">Actions</th>
              </tr>
            </thead>

            {filtered.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={7} className="p-2 sm:p-4 text-center text-black/60">
                    No certificates found.
                  </td>
                </tr>
              </tbody>
            )}

            {filtered.map((c) => {
              const status = getStatus(c.expiryDate);

              const isPDF =
                c.fileUrl &&
                c.fileUrl.toLowerCase().includes(".pdf");

              return (
                <tbody key={c.id} id={`cert-row-${c.id}`}>
                  {/* MAIN ROW */}
                  <tr className={`border-t border-white/40 ${expandedId === c.id ? "ring-2 ring-blue-400" : ""}`}>
                    <td className="p-2 sm:p-4">{c.employee}</td>
                    <td className="p-2 sm:p-4">{c.certificateName}</td>
                    <td className="p-2 sm:p-4">{c.certificateType || "N/A"}</td>
                    <td className="p-2 sm:p-4">{formatDate(c.issueDate)}</td>
                    <td className="p-2 sm:p-4">{formatDate(c.expiryDate)}</td>

                    <td className={`p-2 sm:p-4 font-semibold ${status.color}`}>
                      {status.label}
                    </td>

                    <td className="p-2 sm:p-4 flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleDownloadPdf(c)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        PDF
                      </button>

                      <button
                        onClick={() => toggleExpand(c.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {expandedId === c.id ? "Hide" : "View"}
                      </button>

                      <button
                        onClick={() => handleDelete(c.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDED PREVIEW ROW */}
                  {expandedId === c.id && (
                    <tr className="bg-white/30 backdrop-blur-xl border-t border-white/40">
                      <td colSpan={7} className="p-6">
                        <div className="rounded-xl overflow-hidden shadow-lg bg-white/70 p-4">
                          {!c.fileUrl ? (
                            <p className="text-black/70 py-8 text-center">
                              No document uploaded for this certificate.
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-black/60 mb-2">
                                <a
                                  href={c.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  Open document in new tab
                                </a>
                              </p>
                              {isPDF ? (
                                <iframe
                                  src={c.fileUrl}
                                  className="w-full h-[600px] rounded-xl border border-white/40"
                                  title="Certificate document"
                                />
                              ) : (
                                <img
                                  src={c.fileUrl}
                                  alt="Certificate Preview"
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

