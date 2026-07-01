"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, Upload } from "lucide-react";
import {
  APPLIES_TO_OPTIONS,
  COMPLIANCE_STATUSES,
  LEGISLATION_OPTIONS,
} from "@/lib/legal-compliance";

export type LegalComplianceFormValues = {
  auditRef: string;
  section: string;
  subsection: string;
  legislation: string;
  customLegislation: string;
  requirement: string;
  appliesTo: string;
  customAppliesTo: string;
  status: string;
  weight: string;
  achieved: string;
  score: string;
  observations: string;
  responsiblePerson: string;
  lastReviewedAt: string;
  nextReviewDue: string;
  evidenceUrl: string;
  evidenceNotes: string;
  notes: string;
};

export function emptyLegalComplianceForm(): LegalComplianceFormValues {
  return {
    auditRef: "",
    section: "",
    subsection: "",
    legislation: LEGISLATION_OPTIONS[0],
    customLegislation: "",
    requirement: "",
    appliesTo: APPLIES_TO_OPTIONS[0],
    customAppliesTo: "",
    status: "under_review",
    weight: "",
    achieved: "",
    score: "",
    observations: "",
    responsiblePerson: "",
    lastReviewedAt: "",
    nextReviewDue: "",
    evidenceUrl: "",
    evidenceNotes: "",
    notes: "",
  };
}

export function formFromItem(item: {
  auditRef?: string | null;
  section?: string | null;
  subsection?: string | null;
  legislation: string;
  requirement: string;
  appliesTo: string | null;
  status: string;
  weight?: number | null;
  achieved?: string | null;
  score?: number | null;
  observations?: string | null;
  responsiblePerson: string | null;
  lastReviewedAt: string | Date | null;
  nextReviewDue: string | Date | null;
  evidenceUrl: string | null;
  evidenceNotes: string | null;
  notes: string | null;
}): LegalComplianceFormValues {
  const legislationInList = (LEGISLATION_OPTIONS as readonly string[]).includes(
    item.legislation
  );
  const appliesInList =
    item.appliesTo &&
    (APPLIES_TO_OPTIONS as readonly string[]).includes(item.appliesTo);

  const toDateInput = (v: string | Date | null | undefined) => {
    if (!v) return "";
    const d = typeof v === "string" ? new Date(v) : v;
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  return {
    auditRef: item.auditRef ?? "",
    section: item.section ?? "",
    subsection: item.subsection ?? "",
    legislation: legislationInList ? item.legislation : "Other / Custom",
    customLegislation: legislationInList ? "" : item.legislation,
    requirement: item.requirement,
    appliesTo: appliesInList ? item.appliesTo! : "Specific department",
    customAppliesTo: appliesInList ? "" : item.appliesTo ?? "",
    status: item.status,
    weight: item.weight != null ? String(item.weight) : "",
    achieved: item.achieved ?? "",
    score: item.score != null ? String(item.score) : "",
    observations: item.observations ?? "",
    responsiblePerson: item.responsiblePerson ?? "",
    lastReviewedAt: toDateInput(item.lastReviewedAt),
    nextReviewDue: toDateInput(item.nextReviewDue),
    evidenceUrl: item.evidenceUrl ?? "",
    evidenceNotes: item.evidenceNotes ?? "",
    notes: item.notes ?? "",
  };
}

export function payloadFromForm(form: LegalComplianceFormValues) {
  const legislation =
    form.legislation === "Other / Custom"
      ? form.customLegislation.trim()
      : form.legislation.trim();

  let appliesTo = form.appliesTo.trim();
  if (form.appliesTo === "Specific department") {
    appliesTo = form.customAppliesTo.trim() || "Specific department";
  }

  return {
    auditRef: form.auditRef.trim() || null,
    section: form.section.trim() || null,
    subsection: form.subsection.trim() || null,
    legislation,
    requirement: form.requirement.trim(),
    appliesTo: appliesTo || null,
    status: form.status,
    weight: form.weight.trim() || null,
    achieved: form.achieved.trim() || null,
    score: form.score.trim() || null,
    observations: form.observations.trim() || null,
    responsiblePerson: form.responsiblePerson.trim() || null,
    lastReviewedAt: form.lastReviewedAt || null,
    nextReviewDue: form.nextReviewDue || null,
    evidenceUrl: form.evidenceUrl.trim() || null,
    evidenceNotes:
      form.evidenceNotes.trim() || form.observations.trim() || null,
    notes: form.notes.trim() || null,
  };
}

const inputClass =
  "w-full p-3 rounded-lg border border-white/40 bg-white/70 text-black text-sm";
const labelClass = "block text-sm font-semibold text-black mb-1";

type LegalComplianceFormProps = {
  form: LegalComplianceFormValues;
  onChange: (form: LegalComplianceFormValues) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  cancelHref: string;
  saving?: boolean;
  error?: string | null;
};

export default function LegalComplianceForm({
  form,
  onChange,
  onSubmit,
  submitLabel,
  cancelHref,
  saving = false,
  error,
}: LegalComplianceFormProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function setField<K extends keyof LegalComplianceFormValues>(
    key: K,
    value: LegalComplianceFormValues[K]
  ) {
    onChange({ ...form, [key]: value });
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setField(name as keyof LegalComplianceFormValues, value);
  }

  async function handleEvidenceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF, Word document, or image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be under 10 MB.");
      return;
    }

    setUploading(true);
    setUploadedFileName(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/legal-compliance/upload-evidence", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setField("evidenceUrl", data.url);
      setUploadedFileName(data.fileName ?? file.name);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40"
    >
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 space-y-4">
        <p className="text-sm font-semibold text-black">Audit checklist (optional)</p>
        <p className="text-xs text-black/60 -mt-2">
          Used when loading from Health and Safety Audit.xlsx — ref, section, weight, score.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Audit ref</label>
            <input
              type="text"
              name="auditRef"
              value={form.auditRef}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. 1.1.1-a"
            />
          </div>
          <div>
            <label className={labelClass}>Section</label>
            <input
              type="text"
              name="section"
              value={form.section}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. 1.1 MANAGEMENT STRUCTURES"
            />
          </div>
          <div>
            <label className={labelClass}>Subsection</label>
            <input
              type="text"
              name="subsection"
              value={form.subsection}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. 1.1.1 Policies"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Weight</label>
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              className={inputClass}
              min={0}
            />
          </div>
          <div>
            <label className={labelClass}>Achieved</label>
            <input
              type="text"
              name="achieved"
              value={form.achieved}
              onChange={handleChange}
              className={inputClass}
              placeholder="Score achieved"
            />
          </div>
          <div>
            <label className={labelClass}>Score</label>
            <input
              type="number"
              name="score"
              value={form.score}
              onChange={handleChange}
              className={inputClass}
              min={0}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Audit observations</label>
          <textarea
            name="observations"
            value={form.observations}
            onChange={handleChange}
            rows={2}
            className={inputClass}
            placeholder="Auditor observations for this line item"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Legislation / regulation</label>
        <select
          name="legislation"
          value={form.legislation}
          onChange={handleChange}
          className={inputClass}
          required
        >
          {LEGISLATION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {form.legislation === "Other / Custom" && (
        <div>
          <label className={labelClass}>Custom legislation name</label>
          <input
            type="text"
            name="customLegislation"
            value={form.customLegislation}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. Municipal by-law"
            required
          />
        </div>
      )}

      <div>
        <label className={labelClass}>Requirement (what must be done)</label>
        <textarea
          name="requirement"
          value={form.requirement}
          onChange={handleChange}
          rows={4}
          className={inputClass}
          placeholder="Describe the legal obligation and what your company must maintain"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Applies to</label>
          <select
            name="appliesTo"
            value={form.appliesTo}
            onChange={handleChange}
            className={inputClass}
          >
            {APPLIES_TO_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Compliance status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass}
            required
          >
            {COMPLIANCE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {form.appliesTo === "Specific department" && (
        <div>
          <label className={labelClass}>Department name</label>
          <input
            type="text"
            name="customAppliesTo"
            value={form.customAppliesTo}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. Production, Logistics"
          />
        </div>
      )}

      <div>
        <label className={labelClass}>Responsible person</label>
        <input
          type="text"
          name="responsiblePerson"
          value={form.responsiblePerson}
          onChange={handleChange}
          className={inputClass}
          placeholder="Name of person accountable for this obligation"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Last reviewed</label>
          <input
            type="date"
            name="lastReviewedAt"
            value={form.lastReviewedAt}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Next review due</label>
          <input
            type="date"
            name="nextReviewDue"
            value={form.nextReviewDue}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="rounded-xl border border-white/50 bg-white/40 p-4 space-y-3">
        <p className="text-sm font-semibold text-black">Evidence of compliance</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer">
            <span className="button button-neutral inline-flex items-center gap-2 px-4 py-2 text-sm">
              <Upload size={16} />
              {uploading ? "Uploading…" : "Upload file"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              disabled={uploading}
              accept=".pdf,.doc,.docx,image/*"
              onChange={handleEvidenceUpload}
            />
          </label>
          {uploadedFileName && (
            <span className="text-sm text-black/70">Uploaded: {uploadedFileName}</span>
          )}
          {form.evidenceUrl && (
            <a
              href={form.evidenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              View evidence <ExternalLink size={14} />
            </a>
          )}
          {form.evidenceUrl && (
            <button
              type="button"
              className="text-sm text-red-600 hover:underline"
              onClick={() => {
                setField("evidenceUrl", "");
                setUploadedFileName(null);
              }}
            >
              Remove file
            </button>
          )}
        </div>
        <div>
          <label className={labelClass}>Evidence notes / reference</label>
          <textarea
            name="evidenceNotes"
            value={form.evidenceNotes}
            onChange={handleChange}
            rows={2}
            className={inputClass}
            placeholder="e.g. See Appointments → First Aider, or inspection register ref #12"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Additional notes</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          className={inputClass}
          placeholder="Auditor notes, gaps, action plan…"
        />
      </div>

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={saving} className="button button-save px-6 py-2">
          {saving ? "Saving…" : submitLabel}
        </button>
        <Link href={cancelHref} className="button button-neutral px-6 py-2">
          Cancel
        </Link>
      </div>
    </form>
  );
}
