"use client";

import { useState } from "react";

export default function CostAnalysisPage() {
  const [form, setForm] = useState({
    linkId: "",
    incidentId: "",
    directCost: "",
    indirectCost: "",
    otherCost: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/incidents/cost-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkId: form.linkId || null,
        incidentId: form.incidentId || null,
        directCost: form.directCost ? parseFloat(form.directCost) : 0,
        indirectCost: form.indirectCost ? parseFloat(form.indirectCost) : 0,
        otherCost: form.otherCost ? parseFloat(form.otherCost) : 0,
        notes: form.notes,
      }),
    });

    if (!res.ok) {
      setMessage("Failed to save cost analysis.");
    } else {
      setMessage("Cost analysis saved and linked.");
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 dark:bg-[#0f172a]">
      <div className="max-w-3xl mx-auto bg-white/40 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/30">
        <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">
          Cost Analysis
        </h1>
        <p className="text-black/70 dark:text-white/70 mb-6">
          Work out the direct and indirect costs of an incident. Use the same Link ID as the incident report to tie them together.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-black dark:text-white mb-1">
                Link ID
              </label>
              <input
                value={form.linkId}
                onChange={(e) => update("linkId", e.target.value)}
                className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
                placeholder="Shared ID with incident"
              />
            </div>

            <div>
              <label className="block font-medium text-black dark:text-white mb-1">
                Incident Record ID (optional)
              </label>
              <input
                value={form.incidentId}
                onChange={(e) => update("incidentId", e.target.value)}
                className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
                placeholder="If you want to link directly to a record"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-black dark:text-white mb-1">
                Direct Costs
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.directCost}
                onChange={(e) => update("directCost", e.target.value)}
                className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
              />
            </div>

            <div>
              <label className="block font-medium text-black dark:text-white mb-1">
                Indirect Costs
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.indirectCost}
                onChange={(e) => update("indirectCost", e.target.value)}
                className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
              />
            </div>

            <div>
              <label className="block font-medium text-black dark:text-white mb-1">
                Other Costs
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.otherCost}
                onChange={(e) => update("otherCost", e.target.value)}
                className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-black dark:text-white mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black h-24"
            />
          </div>

          {message && (
            <p className="text-sm mt-2 text-black dark:text-white">{message}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Cost Analysis"}
          </button>
        </form>
      </div>
    </div>
  );
}

