"use client";

import { useState } from "react";
import Link from "next/link";

const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];

export default function AddRiskAssessmentPage() {
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    assessor: "",
    riskLevel: "",
    reviewDate: "",
    controls: "",
    fileUrl: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/risk-assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        department: form.department.trim() || null,
        location: form.location.trim() || null,
        assessor: form.assessor.trim() || null,
        riskLevel: form.riskLevel.trim(),
        reviewDate: form.reviewDate || null,
        controls: form.controls.trim() || null,
        fileUrl: form.fileUrl.trim() || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "Failed to save");
      return;
    }

    alert("Risk assessment saved successfully!");
    window.location.href = "/risk-assessments";
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-3xl mx-auto space-y-10">
        <Link href="/risk-assessments" className="text-black/70 hover:text-black">
          ← Risk Assessments
        </Link>

        <h1 className="text-4xl font-bold text-black">Add Risk Assessment</h1>
        <p className="text-black/70">Record a new workplace risk assessment.</p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40"
        >
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Manual handling in warehouse"
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Assessor</label>
              <input
                type="text"
                name="assessor"
                value={form.assessor}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Risk Level</label>
              <select
                name="riskLevel"
                value={form.riskLevel}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70 text-black"
                required
              >
                <option value="">Select level...</option>
                {RISK_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Review Date</label>
            <input
              type="date"
              name="reviewDate"
              value={form.reviewDate}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Controls / Mitigations
            </label>
            <textarea
              name="controls"
              value={form.controls}
              onChange={handleChange}
              rows={4}
              placeholder="Describe risk controls and mitigations..."
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Document URL (optional)
            </label>
            <input
              type="url"
              name="fileUrl"
              value={form.fileUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          <button type="submit" className="button button-save w-full py-3">
            Save Assessment
          </button>
        </form>
      </div>
    </div>
  );
}
