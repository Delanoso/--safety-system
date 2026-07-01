"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Plus,
  Trash2,
  ExternalLink,
  Pencil,
  Scale,
  Sparkles,
  Upload,
  ClipboardList,
  Download,
} from "lucide-react";
import {
  COMPLIANCE_STATUSES,
  LEGISLATION_OPTIONS,
  formatDateDisplay,
  isReviewOverdue,
  statusColorClass,
  statusLabel,
} from "@/lib/legal-compliance";
import { downloadPdf } from "@/lib/pdf-download";

type Item = {
  id: string;
  auditRef: string | null;
  section: string | null;
  subsection: string | null;
  legislation: string;
  requirement: string;
  appliesTo: string | null;
  status: string;
  weight: number | null;
  achieved: string | null;
  score: number | null;
  observations: string | null;
  responsiblePerson: string | null;
  lastReviewedAt: string | null;
  nextReviewDue: string | null;
  evidenceUrl: string | null;
  evidenceNotes: string | null;
  notes: string | null;
};

type Stats = {
  total: number;
  compliant: number;
  nonCompliant: number;
  overdueReview: number;
  auditScoreTotal?: number;
  auditWeightTotal?: number;
};

export default function LegalCompliancePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    compliant: 0,
    nonCompliant: 0,
    overdueReview: 0,
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [legislationFilter, setLegislationFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [dueFilter, setDueFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (legislationFilter !== "all") params.set("legislation", legislationFilter);
    if (sectionFilter !== "all") params.set("section", sectionFilter);
    if (dueFilter !== "all") params.set("due", dueFilter);
    if (search.trim()) params.set("search", search.trim());

    const res = await fetch(`/api/legal-compliance?${params.toString()}`);
    const data = await res.json();
    if (res.ok) {
      setItems(Array.isArray(data.items) ? data.items : []);
      setStats(
        data.stats ?? { total: 0, compliant: 0, nonCompliant: 0, overdueReview: 0 }
      );
      setSections(Array.isArray(data.sections) ? data.sections : []);
    } else {
      setItems([]);
    }
    setLoading(false);
  }, [statusFilter, legislationFilter, sectionFilter, dueFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  async function handleDelete(id: string) {
    if (!confirm("Remove this obligation from the register?")) return;
    const res = await fetch(`/api/legal-compliance/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Failed to delete");
      return;
    }
    load();
  }

  async function handleSeedAudit() {
    if (
      !confirm(
        "Load the full Salus HSE audit checklist (277 items from Health and Safety Audit.xlsx)? Existing rows will not be duplicated."
      )
    ) {
      return;
    }
    setSeeding(true);
    try {
      const res = await fetch("/api/legal-compliance/seed-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load checklist");
      alert(data.message ?? `Added ${data.created} item(s).`);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load audit checklist");
    } finally {
      setSeeding(false);
    }
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const merge = confirm(
      "OK = merge/update from Excel (keeps existing rows and updates scores).\nCancel = replace entire register with file contents."
    );

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", merge ? "merge" : "replace");

      const res = await fetch("/api/legal-compliance/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Import failed");
      alert(data.message ?? "Import complete.");
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const auditPercent =
    stats.auditWeightTotal && stats.auditWeightTotal > 0
      ? Math.round(((stats.auditScoreTotal ?? 0) / stats.auditWeightTotal) * 100)
      : null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-green-200 to-blue-300 min-w-0">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/legal-registers" className="text-black/70 hover:text-black text-sm">
            ← Legislation library
          </Link>
          <Link
            href="/dashboard"
            className="button button-neutral flex items-center gap-2 text-sm"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Scale className="text-[var(--gold)]" size={32} />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
                Legal Compliance Register
              </h1>
            </div>
            <p className="text-black/70 mt-2 text-sm sm:text-base max-w-2xl">
              Built from your <strong>Health and Safety Audit</strong> workbook — track each audit
              line, compliance status, scores, observations, and evidence per company.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSeedAudit}
              disabled={seeding}
              className="button button-save flex items-center gap-2 text-sm"
            >
              <ClipboardList size={16} />
              {seeding ? "Loading…" : "Load audit checklist (277)"}
            </button>
            <label className="button button-neutral flex items-center gap-2 text-sm cursor-pointer">
              <Upload size={16} />
              {importing ? "Importing…" : "Import Excel"}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                disabled={importing}
                onChange={handleImportExcel}
              />
            </label>
            <Link
              href="/legal-compliance/add"
              className="button button-neutral flex items-center gap-2 text-sm"
            >
              <Plus size={18} />
              Add line
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="rounded-xl bg-white/60 border border-white/40 p-4">
            <p className="text-xs text-black/60 uppercase tracking-wide">Total lines</p>
            <p className="text-2xl font-bold text-black">{stats.total}</p>
          </div>
          <div className="rounded-xl bg-white/60 border border-white/40 p-4">
            <p className="text-xs text-black/60 uppercase tracking-wide">Compliant</p>
            <p className="text-2xl font-bold text-green-700">{stats.compliant}</p>
          </div>
          <div className="rounded-xl bg-white/60 border border-white/40 p-4">
            <p className="text-xs text-black/60 uppercase tracking-wide">Non-compliant</p>
            <p className="text-2xl font-bold text-red-700">{stats.nonCompliant}</p>
          </div>
          <div className="rounded-xl bg-white/60 border border-white/40 p-4">
            <p className="text-xs text-black/60 uppercase tracking-wide">Review overdue</p>
            <p className="text-2xl font-bold text-amber-700">{stats.overdueReview}</p>
          </div>
          <div className="rounded-xl bg-white/60 border border-white/40 p-4 col-span-2 lg:col-span-1">
            <p className="text-xs text-black/60 uppercase tracking-wide">Audit score</p>
            <p className="text-2xl font-bold text-black">
              {auditPercent != null ? `${auditPercent}%` : "—"}
            </p>
            {stats.auditScoreTotal != null && stats.auditWeightTotal ? (
              <p className="text-xs text-black/50 mt-1">
                {stats.auditScoreTotal} / {stats.auditWeightTotal} weighted
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search ref, section, requirement, observations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] p-3 rounded-xl bg-white/70 border border-white/40 text-sm"
          />
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="p-3 rounded-xl bg-white/70 border border-white/40 text-sm min-w-[200px] max-w-full"
          >
            <option value="all">All audit sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>
                {s.length > 42 ? `${s.slice(0, 39)}…` : s}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 rounded-xl bg-white/70 border border-white/40 text-sm min-w-[160px]"
          >
            <option value="all">All statuses</option>
            {COMPLIANCE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={legislationFilter}
            onChange={(e) => setLegislationFilter(e.target.value)}
            className="p-3 rounded-xl bg-white/70 border border-white/40 text-sm min-w-[200px] max-w-full"
          >
            <option value="all">All legislation</option>
            {LEGISLATION_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l.length > 48 ? `${l.slice(0, 45)}…` : l}
              </option>
            ))}
          </select>
          <select
            value={dueFilter}
            onChange={(e) => setDueFilter(e.target.value)}
            className="p-3 rounded-xl bg-white/70 border border-white/40 text-sm min-w-[160px]"
          >
            <option value="all">All review dates</option>
            <option value="overdue">Review overdue</option>
            <option value="due_soon">Due within 30 days</option>
          </select>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="border-b border-black/10 bg-black/5">
                <th className="p-3 font-semibold text-sm">Ref</th>
                <th className="p-3 font-semibold text-sm">Section / requirement</th>
                <th className="p-3 font-semibold text-sm">Status</th>
                <th className="p-3 font-semibold text-sm">Score</th>
                <th className="p-3 font-semibold text-sm">Observations</th>
                <th className="p-3 font-semibold text-sm w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-black/60">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-black/60">
                    <p className="mb-3">No audit lines yet.</p>
                    <button
                      type="button"
                      onClick={handleSeedAudit}
                      className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                    >
                      <Sparkles size={14} />
                      Load HSE audit checklist (277 items)
                    </button>
                    {" or "}
                    <label className="text-blue-600 hover:underline text-sm cursor-pointer">
                      import your Excel file
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleImportExcel}
                      />
                    </label>
                    .
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const overdue = isReviewOverdue(item.nextReviewDue);
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-black/5 hover:bg-white/40 ${
                        overdue ? "bg-amber-50/50" : ""
                      }`}
                    >
                      <td className="p-3 text-xs align-top whitespace-nowrap font-mono text-black/70">
                        {item.auditRef ?? "—"}
                      </td>
                      <td className="p-3 text-sm align-top max-w-md">
                        {item.subsection && (
                          <p className="text-xs font-medium text-black/60 mb-1">
                            {item.subsection}
                          </p>
                        )}
                        <p>{item.requirement}</p>
                        <p className="text-xs text-black/45 mt-1 line-clamp-1">
                          {item.legislation}
                        </p>
                      </td>
                      <td className="p-3 align-top">
                        <span
                          className={`inline-block text-xs font-medium px-2 py-1 rounded ${statusColorClass(item.status)}`}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td className="p-3 text-sm align-top whitespace-nowrap">
                        {item.weight != null ? (
                          <span>
                            {item.score ?? 0}/{item.weight}
                            {item.achieved ? (
                              <span className="block text-xs text-black/50">
                                Achieved: {item.achieved}
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3 text-sm align-top max-w-[200px]">
                        {(item.observations || item.evidenceNotes) && (
                          <p className="text-xs text-black/60 line-clamp-3">
                            {item.observations || item.evidenceNotes}
                          </p>
                        )}
                        {item.evidenceUrl && (
                          <a
                            href={item.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1 text-xs mt-1"
                          >
                            Evidence <ExternalLink size={12} />
                          </a>
                        )}
                        {!item.observations && !item.evidenceNotes && !item.evidenceUrl && (
                          <span className="text-black/40 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => downloadPdf("legal-compliance", item.id)}
                            className="text-gray-700 hover:text-gray-900"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          <Link
                            href={`/legal-compliance/${item.id}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
