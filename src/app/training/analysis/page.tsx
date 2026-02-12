"use client";

import { useEffect, useState } from "react";

type Certificate = {
  id: number;
  employee: string;
  certificateName: string;
  certificateType: string | null;
  issueDate: string;
  expiryDate: string;
  notes: string | null;
  fileUrl: string | null;
  createdAt: string;
};

type StatusKey = "all" | "valid" | "expired" | "expiring-soon" | "warning";

export default function TrainingAnalysisPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusKey>("all");
  const [certificateNameFilter, setCertificateNameFilter] = useState<string>("all");
  const [certificateTypeFilter, setCertificateTypeFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/certificates");
      const data = await res.json();
      setCertificates(data);
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

  const statusMatches = (c: Certificate) => {
    const status = getStatus(c.expiryDate);
    if (statusFilter === "all") return true;
    return status.key === statusFilter;
  };

  const filteredCertificates = certificates.filter((c) => {
    if (!statusMatches(c)) return false;
    if (certificateNameFilter !== "all" && c.certificateName !== certificateNameFilter) return false;
    if (certificateTypeFilter !== "all" && (c.certificateType || "") !== certificateTypeFilter) return false;
    return true;
  });

  const groupedByCertificateName = filteredCertificates.reduce<Record<string, Certificate[]>>((acc, c) => {
    const name = c.certificateName || "Unnamed";
    if (!acc[name]) acc[name] = [];
    acc[name].push(c);
    return acc;
  }, {});

  const uniqueCertificateNames = Array.from(new Set(certificates.map((c) => c.certificateName).filter(Boolean))).sort();
  const uniqueCertificateTypes = Array.from(new Set(certificates.map((c) => c.certificateType || "").filter(Boolean))).sort();

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-black">Training Analysis</h1>
        <p className="text-black/70">
          See who has been trained and who needs training. Filter by status and certificate.
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
              <span className="text-black/80 text-sm">Certificate name:</span>
              <select
                value={certificateNameFilter}
                onChange={(e) => setCertificateNameFilter(e.target.value)}
                className="p-2 rounded-lg border border-white/40 bg-white/70 text-black min-w-[180px]"
              >
                <option value="all">All</option>
                {uniqueCertificateNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-black/80 text-sm">Type:</span>
              <select
                value={certificateTypeFilter}
                onChange={(e) => setCertificateTypeFilter(e.target.value)}
                className="p-2 rounded-lg border border-white/40 bg-white/70 text-black min-w-[140px]"
              >
                <option value="all">All</option>
                {uniqueCertificateTypes.map((type) => (
                  <option key={type || "blank"} value={type || ""}>
                    {type || "—"}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {Object.keys(groupedByCertificateName).length === 0 ? (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-8 text-center text-black/60">
            No certificates match the current filters.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByCertificateName)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([certName, certs]) => (
                <div
                  key={certName}
                  className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden"
                >
                  <div className="bg-white/40 px-6 py-4 border-b border-white/40">
                    <h2 className="text-xl font-bold text-black">{certName}</h2>
                    <p className="text-sm text-black/60">
                      {certs.length} employee{certs.length !== 1 ? "s" : ""} ·{" "}
                      {certs.filter((c) => getStatus(c.expiryDate).key === "valid").length} valid,{" "}
                      {certs.filter((c) => getStatus(c.expiryDate).key === "expired").length} expired
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-white/30 border-b border-white/40">
                          <th className="p-4 font-semibold text-black">Employee</th>
                          <th className="p-4 font-semibold text-black">Type</th>
                          <th className="p-4 font-semibold text-black">Issue Date</th>
                          <th className="p-4 font-semibold text-black">Expiry Date</th>
                          <th className="p-4 font-semibold text-black">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certs
                          .sort((a, b) => a.employee.localeCompare(b.employee))
                          .map((c) => {
                            const status = getStatus(c.expiryDate);
                            return (
                              <tr key={c.id} className="border-t border-white/40">
                                <td className="p-4 text-black">{c.employee}</td>
                                <td className="p-4 text-black/80">{c.certificateType || "—"}</td>
                                <td className="p-4 text-black/80">{formatDate(c.issueDate)}</td>
                                <td className="p-4 text-black/80">{formatDate(c.expiryDate)}</td>
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
