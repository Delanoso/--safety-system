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

type StatusKey = "all" | "valid" | "expired" | "expiring-soon" | "warning";

export default function MedicalAnalysisPage() {
  const [medicals, setMedicals] = useState<Medical[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusKey>("all");
  const [medicalTypeFilter, setMedicalTypeFilter] = useState<string>("all");

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
    if (days < 0) return { label: "Expired", color: "text-red-700", key: "expired" as const };
    if (days <= 30) return { label: "Expiring Soon", color: "text-red-500", key: "expiring-soon" as const };
    if (days <= 60) return { label: "Warning", color: "text-orange-500", key: "warning" as const };
    return { label: "Valid", color: "text-green-600", key: "valid" as const };
  }

  const statusMatches = (m: Medical) => {
    const status = getStatus(m.expiryDate);
    if (statusFilter === "all") return true;
    return status.key === statusFilter;
  };

  const filteredMedicals = medicals.filter((m) => {
    if (!statusMatches(m)) return false;
    if (medicalTypeFilter !== "all" && m.medicalType !== medicalTypeFilter) return false;
    return true;
  });

  const groupedByMedicalType = filteredMedicals.reduce<Record<string, Medical[]>>((acc, m) => {
    const type = m.medicalType || "Unspecified";
    if (!acc[type]) acc[type] = [];
    acc[type].push(m);
    return acc;
  }, {});

  const uniqueMedicalTypes = Array.from(new Set(medicals.map((m) => m.medicalType).filter(Boolean))).sort();

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-black">Medical Analysis</h1>
        <p className="text-black/70">
          See who is medically compliant and who needs renewal. Filter by status and medical type.
        </p>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-black">Filters</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2">
              <span className="text-black/80 text-sm">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusKey)}
                className="p-2 rounded-lg border border-white/40 bg-white/70 text-black"
              >
                <option value="all">All</option>
                <option value="valid">Valid</option>
                <option value="expired">Expired</option>
                <option value="expiring-soon">Expiring Soon</option>
                <option value="warning">Warning</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-black/80 text-sm">Medical type:</span>
              <select
                value={medicalTypeFilter}
                onChange={(e) => setMedicalTypeFilter(e.target.value)}
                className="p-2 rounded-lg border border-white/40 bg-white/70 text-black min-w-[200px]"
              >
                <option value="all">All</option>
                {uniqueMedicalTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {Object.keys(groupedByMedicalType).length === 0 ? (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-8 text-center text-black/60">
            No medicals match the current filters.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByMedicalType)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([medicalType, records]) => (
                <div
                  key={medicalType}
                  className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden"
                >
                  <div className="bg-white/40 px-6 py-4 border-b border-white/40">
                    <h2 className="text-xl font-bold text-black">{medicalType}</h2>
                    <p className="text-sm text-black/60">
                      {records.length} employee{records.length !== 1 ? "s" : ""} ·{" "}
                      {records.filter((m) => getStatus(m.expiryDate).key === "valid").length} valid,{" "}
                      {records.filter((m) => getStatus(m.expiryDate).key === "expired").length} expired
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/30 border-b border-white/40">
                          <th className="p-4 font-semibold text-black">Employee</th>
                          <th className="p-4 font-semibold text-black">Issue Date</th>
                          <th className="p-4 font-semibold text-black">Expiry Date</th>
                          <th className="p-4 font-semibold text-black">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records
                          .sort((a, b) => a.employee.localeCompare(b.employee))
                          .map((m) => {
                            const status = getStatus(m.expiryDate);
                            return (
                              <tr key={m.id} className="border-t border-white/40">
                                <td className="p-4 text-black">{m.employee}</td>
                                <td className="p-4 text-black/80">{formatDate(m.issueDate)}</td>
                                <td className="p-4 text-black/80">{formatDate(m.expiryDate)}</td>
                                <td className={`p-4 font-semibold ${status.color}`}>{status.label}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
