"use client";

import { useState } from "react";
import Link from "next/link";

export default function AddContractorPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    scope: "ongoing" as "ongoing" | "specific_job",
    jobDescription: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          contactEmail: form.contactEmail.trim() || null,
          contactPhone: form.contactPhone.trim() || null,
          scope: form.scope,
          jobDescription: form.jobDescription.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.details || data?.error || "Failed to create contractor";
        alert(msg);
        return;
      }

      const created = await res.json();
      window.location.href = `/contractors/${created.id}`;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-3xl mx-auto space-y-10">
        <Link href="/contractors" className="text-black/70 hover:text-black">
          ← Contractors Portal
        </Link>

        <h1 className="text-4xl font-bold text-black">Add Contractor</h1>
        <p className="text-black/70">
          Create a contractor record for their safety file.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40"
        >
          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Company / Business Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. ABC Construction Ltd"
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="contractor@example.com"
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
                placeholder="+27..."
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Scope
            </label>
            <select
              name="scope"
              value={form.scope}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            >
              <option value="ongoing">Ongoing on-site work</option>
              <option value="specific_job">Specific job only</option>
            </select>
          </div>

          {form.scope === "specific_job" && (
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Job Description
              </label>
              <textarea
                name="jobDescription"
                value={form.jobDescription}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the specific work to be done..."
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button button-save w-full py-3 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Contractor"}
          </button>
        </form>
      </div>
    </div>
  );
}
