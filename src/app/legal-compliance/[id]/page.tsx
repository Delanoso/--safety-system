"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LegalComplianceForm, {
  emptyLegalComplianceForm,
  formFromItem,
  payloadFromForm,
} from "@/components/legal-compliance/LegalComplianceForm";
import { formatDateDisplay, statusColorClass, statusLabel } from "@/lib/legal-compliance";
import { downloadPdf } from "@/lib/pdf-download";

export default function EditLegalCompliancePage() {
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState(emptyLegalComplianceForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/legal-compliance/${id}`);
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setForm(formFromItem(data));
      setUpdatedAt(data.updatedAt ?? null);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = payloadFromForm(form);
    if (!payload.legislation || !payload.requirement) {
      setError("Legislation and requirement are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/legal-compliance/${id}`, {
        method: "PATCH",
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

  if (loading) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-green-200 to-blue-300 flex items-center justify-center">
        <p className="text-black/70">Loading…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-green-200 to-blue-300">
        <div className="max-w-3xl mx-auto">
          <Link href="/legal-compliance" className="text-black/70 hover:text-black">
            ← Legal Compliance Register
          </Link>
          <p className="mt-4 text-red-600">Obligation not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-green-200 to-blue-300 min-w-0">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Link href="/legal-compliance" className="text-black/70 hover:text-black">
            ← Legal Compliance Register
          </Link>
          <button
            type="button"
            onClick={() => downloadPdf("legal-compliance", id)}
            className="button button-neutral"
          >
            Download PDF
          </button>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-black">Edit obligation</h1>
            <p className="text-black/70 mt-1">Update compliance status, evidence, or review dates.</p>
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${statusColorClass(form.status)}`}
          >
            {statusLabel(form.status)}
          </span>
        </div>

        {updatedAt && (
          <p className="text-xs text-black/50">
            Last updated: {formatDateDisplay(updatedAt)}
          </p>
        )}

        <LegalComplianceForm
          form={form}
          onChange={setForm}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          cancelHref="/legal-compliance"
          saving={saving}
          error={error}
        />
      </div>
    </div>
  );
}
