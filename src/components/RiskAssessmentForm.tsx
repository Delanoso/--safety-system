"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  HAZARD_SUGGESTIONS,
  RISK_LEVELS,
  emptyHazardRow,
  emptyRiskAssessmentData,
  formatRiskAssessmentText,
  overallRiskFromHazards,
  parseRiskAssessmentControls,
  type RiskAssessmentData,
  type RiskHazardRow,
} from "@/lib/risk-assessment";

export type RiskAssessmentFormValues = {
  title: string;
  department: string;
  location: string;
  assessor: string;
  reviewDate: string;
  riskLevel: string;
  fileUrl: string;
  template: RiskAssessmentData;
};

type RiskAssessmentFormProps = {
  initial?: Partial<RiskAssessmentFormValues> & { controls?: string | null };
  initialStep?: number;
  submitLabel?: string;
  /** Rendered on step 3 above the save button (e.g. signature). */
  step3Footer?: ReactNode;
  onSubmit: (values: RiskAssessmentFormValues) => Promise<void>;
};

const inputClass =
  "w-full p-3 rounded-lg border border-white/40 bg-white/70 text-black text-sm";
const labelClass = "block text-sm font-semibold text-black mb-1";

function RiskSelect({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
      required={required}
    >
      <option value="">Select…</option>
      {RISK_LEVELS.map((l) => (
        <option key={l} value={l}>
          {l}
        </option>
      ))}
    </select>
  );
}

export default function RiskAssessmentForm({
  initial,
  initialStep = 1,
  submitLabel = "Save assessment",
  step3Footer,
  onSubmit,
}: RiskAssessmentFormProps) {
  const parsed = parseRiskAssessmentControls(initial?.controls ?? null);
  const templateInitial =
    parsed.type === "structured" ? parsed.data : emptyRiskAssessmentData();

  const [step, setStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [department, setDepartment] = useState(initial?.department ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [assessor, setAssessor] = useState(initial?.assessor ?? "");
  const [reviewDate, setReviewDate] = useState(initial?.reviewDate ?? "");
  const [riskLevel, setRiskLevel] = useState(initial?.riskLevel ?? "");
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl ?? "");
  const [preparedDate, setPreparedDate] = useState(
    templateInitial.preparedDate ?? new Date().toISOString().split("T")[0]
  );
  const [ppeRequired, setPpeRequired] = useState(templateInitial.ppeRequired ?? "");
  const [hazards, setHazards] = useState<RiskHazardRow[]>(templateInitial.hazards);

  const autoRisk = useMemo(() => overallRiskFromHazards(hazards), [hazards]);
  const effectiveRisk = riskLevel || autoRisk;

  function updateHazard(index: number, field: keyof RiskHazardRow, value: string) {
    setHazards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addHazard(prefill?: string) {
    setHazards((prev) => [
      ...prev,
      prefill ? { ...emptyHazardRow(), hazard: prefill } : emptyHazardRow(),
    ]);
  }

  function removeHazard(index: number) {
    setHazards((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function validateStep(s: number): string | null {
    if (s === 1 && !title.trim()) return "Please enter what is being assessed (task or activity).";
    if (s === 2) {
      const filled = hazards.filter((h) => h.hazard.trim());
      if (filled.length === 0) return "Add at least one hazard.";
      for (const h of filled) {
        if (!h.riskBefore) return "Select the risk level before controls for each hazard.";
        if (!h.controlMeasures.trim()) return "Describe control measures for each hazard.";
        if (!h.riskAfter) return "Select the residual risk after controls for each hazard.";
      }
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep(1) || validateStep(2);
    if (err) {
      setError(err);
      return;
    }

    const template: RiskAssessmentData = {
      version: 1,
      preparedDate: preparedDate || undefined,
      ppeRequired: ppeRequired.trim() || undefined,
      hazards: hazards.filter((h) => h.hazard.trim()),
    };

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        assessor: assessor.trim(),
        reviewDate,
        riskLevel: effectiveRisk,
        fileUrl: fileUrl.trim(),
        template,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  }

  const steps = [
    { n: 1, label: "Basics" },
    { n: 2, label: "Hazards" },
    { n: 3, label: "Review" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <button
            key={s.n}
            type="button"
            onClick={() => {
              const v = validateStep(step);
              if (s.n > step && v) {
                setError(v);
                return;
              }
              setError(null);
              setStep(s.n);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              step === s.n
                ? "bg-blue-600 text-white"
                : "bg-white/70 text-black border border-white/50 hover:bg-white"
            }`}
          >
            {s.n}. {s.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {step === 1 && (
        <section className="space-y-4 rounded-xl bg-white/50 p-4 sm:p-6 border border-white/60">
          <h2 className="text-lg font-semibold text-black">Step 1 — What are you assessing?</h2>
          <p className="text-sm text-black/70">
            Start with the task or activity. You can add hazards in the next step.
          </p>
          <div>
            <label className={labelClass}>Task / activity *</label>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Loading pallets with forklift"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Department</label>
              <input
                className={inputClass}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Warehouse"
              />
            </div>
            <div>
              <label className={labelClass}>Location / area</label>
              <input
                className={inputClass}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Loading bay"
              />
            </div>
            <div>
              <label className={labelClass}>Assessor (your name)</label>
              <input
                className={inputClass}
                value={assessor}
                onChange={(e) => setAssessor(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Date prepared</label>
              <input
                type="date"
                className={inputClass}
                value={preparedDate}
                onChange={(e) => setPreparedDate(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Review date</label>
              <input
                type="date"
                className={inputClass}
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="button button-save px-6 py-2"
              onClick={() => {
                const v = validateStep(1);
                if (v) setError(v);
                else {
                  setError(null);
                  setStep(2);
                }
              }}
            >
              Next: Hazards →
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4 rounded-xl bg-white/50 p-4 sm:p-6 border border-white/60">
          <h2 className="text-lg font-semibold text-black">Step 2 — Hazards and controls</h2>
          <p className="text-sm text-black/70">
            For each hazard, describe what could go wrong, the controls in place, and the risk
            level before and after controls.
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-black/60 w-full">Quick add:</span>
            {HAZARD_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addHazard(s)}
                className="text-xs px-2 py-1 rounded-full bg-white border border-black/10 hover:border-blue-400"
              >
                + {s}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {hazards.map((h, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/70 bg-white/80 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-black">Hazard {idx + 1}</span>
                  {hazards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHazard(idx)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div>
                  <label className={labelClass}>What is the hazard? *</label>
                  <input
                    className={inputClass}
                    value={h.hazard}
                    onChange={(e) => updateHazard(idx, "hazard", e.target.value)}
                    placeholder="e.g. Slip on wet floor"
                  />
                </div>
                <div>
                  <label className={labelClass}>Who might be harmed?</label>
                  <input
                    className={inputClass}
                    value={h.whoAtRisk}
                    onChange={(e) => updateHazard(idx, "whoAtRisk", e.target.value)}
                    placeholder="e.g. Operators, visitors"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Risk before controls *</label>
                    <RiskSelect
                      value={h.riskBefore}
                      onChange={(v) => updateHazard(idx, "riskBefore", v)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Risk after controls *</label>
                    <RiskSelect
                      value={h.riskAfter}
                      onChange={(v) => updateHazard(idx, "riskAfter", v)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Control measures *</label>
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={h.controlMeasures}
                    onChange={(e) => updateHazard(idx, "controlMeasures", e.target.value)}
                    placeholder="e.g. Anti-slip mats, spill procedure, PPE"
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addHazard()}
            className="text-sm text-blue-700 hover:underline"
          >
            + Add another hazard
          </button>

          <div className="flex flex-wrap gap-3 justify-between pt-2">
            <button type="button" className="button button-neutral px-6 py-2" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button
              type="button"
              className="button button-save px-6 py-2"
              onClick={() => {
                const v = validateStep(2);
                if (v) setError(v);
                else {
                  setError(null);
                  if (!riskLevel) setRiskLevel(autoRisk);
                  setStep(3);
                }
              }}
            >
              Next: Review →
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-4 rounded-xl bg-white/50 p-4 sm:p-6 border border-white/60">
          <h2 className="text-lg font-semibold text-black">Step 3 — Review and save</h2>

          <div>
            <label className={labelClass}>PPE required (optional)</label>
            <textarea
              className={inputClass}
              rows={2}
              value={ppeRequired}
              onChange={(e) => setPpeRequired(e.target.value)}
              placeholder="e.g. Safety boots, gloves, hi-vis vest"
            />
          </div>

          <div>
            <label className={labelClass}>Overall risk rating</label>
            <select
              className={inputClass}
              value={riskLevel || autoRisk}
              onChange={(e) => setRiskLevel(e.target.value)}
            >
              {RISK_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <p className="text-xs text-black/60 mt-1">
              Suggested from highest residual risk: <strong>{autoRisk}</strong>
            </p>
          </div>

          <div className="rounded-lg bg-white/90 border border-black/10 p-4 text-sm text-black/80 space-y-2 max-h-64 overflow-y-auto">
            <p className="font-semibold text-black">{title}</p>
            <p>
              {[department, location].filter(Boolean).join(" · ") || "No department/location"}
            </p>
            <pre className="whitespace-pre-wrap font-sans text-xs">
              {formatRiskAssessmentText({
                version: 1,
                preparedDate,
                ppeRequired,
                hazards: hazards.filter((h) => h.hazard.trim()),
              })}
            </pre>
          </div>

          <div>
            <label className={labelClass}>Supporting document URL (optional)</label>
            <input
              type="url"
              className={inputClass}
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {step3Footer}

          <div className="flex flex-wrap gap-3 justify-between pt-2">
            <button type="button" className="button button-neutral px-6 py-2" onClick={() => setStep(2)}>
              ← Back
            </button>
            <button type="submit" disabled={saving} className="button button-save px-8 py-2">
              {saving ? "Saving…" : submitLabel}
            </button>
          </div>
        </section>
      )}
    </form>
  );
}