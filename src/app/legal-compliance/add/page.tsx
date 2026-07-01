"use client";

import { useState } from "react";
import Link from "next/link";
import LegalComplianceForm, {
  emptyLegalComplianceForm,
  payloadFromForm,
} from "@/components/legal-compliance/LegalComplianceForm";

export default function AddLegalCompliancePage() {
  const [form, setForm] = useState(emptyLegalComplianceForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = payloadFromForm(form);
    if (!payload.legislation) {
      setError("Legislation is required.");
      return;
    }
    if (!payload.requirement) {
      setError("Requirement is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/legal-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      window.location.href = "/legal-compliance";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-green-200 to-blue-300 min-w-0">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/legal-compliance" className="text-black/70 hover:text-black">
          ← Legal Compliance Register
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-black">Add obligation</h1>
          <p className="text-black/70 mt-1">
            Record a legal requirement your company must comply with.
          </p>
        </div>

        <LegalComplianceForm
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          submitLabel="Save obligation"
          cancelHref="/legal-compliance"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  );
}
