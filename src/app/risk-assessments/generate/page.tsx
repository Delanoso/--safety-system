"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const INDUSTRY_SECTORS = [
  "Manufacturing",
  "Construction",
  "Healthcare",
  "Retail",
  "Office / Administration",
  "Warehouse & Logistics",
  "Hospitality",
  "Agriculture",
  "Mining & Quarrying",
  "Oil & Gas",
  "Other",
];

const ASSESSMENT_TYPES = [
  "General Risk Assessment",
  "Task-based Risk Assessment",
  "COSHH (Hazardous Substances)",
  "Fire Risk Assessment",
  "Manual Handling",
  "Work at Height",
  "Contractor Risk Assessment",
  "Office Risk Assessment",
  "Machinery Risk Assessment",
  "Other",
];

export default function GenerateRiskAssessmentPage() {
  const [form, setForm] = useState({
    industrySector: "",
    assessmentType: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.industrySector || !form.assessmentType) {
      setError("Industry sector and assessment type are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/risk-assessments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industrySector: form.industrySector.trim(),
          assessmentType: form.assessmentType.trim(),
          description: form.description.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.details || data?.error || "Failed to generate");
      window.location.href = `/risk-assessments/${data.id}/edit`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-2xl mx-auto space-y-10">
        <Link href="/risk-assessments" className="text-black/70 hover:text-black">
          ← Risk Assessments
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-[var(--gold)]">
            <Sparkles size={32} />
          </span>
          <h1 className="text-4xl font-bold text-black">Generate Risk Assessment</h1>
        </div>
        <p className="text-black/70">
          Enter details below. AI will generate a risk assessment tailored to your industry
          and type. You can edit and sign it on the next page.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40"
        >
          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Industry Sector
            </label>
            <select
              name="industrySector"
              value={form.industrySector}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70 text-black"
              required
            >
              <option value="">Select sector...</option>
              {INDUSTRY_SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Type of Risk Assessment
            </label>
            <select
              name="assessmentType"
              value={form.assessmentType}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70 text-black"
              required
            >
              <option value="">Select type...</option>
              {ASSESSMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Additional Description or Comments
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="e.g. Forklift operations in main warehouse, specific hazards to consider..."
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          {error && (
            <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button button-save w-full py-3 flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            {loading ? "Generating..." : "Generate"}
          </button>
        </form>
      </div>
    </div>
  );
}
