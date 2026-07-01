"use client";

import { useState } from "react";
import Link from "next/link";
import PersonAutocomplete, { type CompanyPersonRecord } from "@/components/PersonAutocomplete";
import { INDUCTION_TYPES } from "@/lib/site-safety";

export default function AddInductionTrainingPage() {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    employee: "",
    inductionType: "",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    department: "",
    trainer: "",
    notes: "",
    fileUrl: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/induction-training/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) { alert(json.error ?? "Upload failed"); return; }
      if (json.url) setForm((prev) => ({ ...prev, fileUrl: json.url }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/induction-training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, fileUrl: form.fileUrl || null, expiryDate: form.expiryDate || null }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? "Failed to save");
      return;
    }
    window.location.href = "/induction-training/list";
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/induction-training" className="button button-neutral">Back</Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Record Induction</h1>
        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
          <PersonAutocomplete
            label="Search employee"
            onSelect={(person: CompanyPersonRecord) => {
              const name = [person.name, person.surname].filter(Boolean).join(" ");
              setForm((prev) => ({ ...prev, employee: name, department: person.department ?? prev.department }));
            }}
          />
          <div>
            <label className="block text-sm font-semibold mb-1">Employee *</label>
            <input name="employee" value={form.employee} onChange={handleChange} required className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Induction type *</label>
            <select name="inductionType" value={form.inductionType} onChange={handleChange} required className="w-full p-3 rounded-lg border border-white/40 bg-white/70">
              <option value="">Select type...</option>
              {INDUCTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Induction date *</label>
              <input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} required className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Expiry date</label>
              <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Department</label>
              <input name="department" value={form.department} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Trainer</label>
              <input name="trainer" value={form.trainer} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Attachment</label>
            <input type="file" accept="application/pdf,image/*" onChange={handleFile} />
            {uploading && <p className="text-sm text-blue-700 mt-1">Uploading…</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>
          <button type="submit" disabled={uploading} className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">Save Induction</button>
        </form>
      </div>
    </div>
  );
}
