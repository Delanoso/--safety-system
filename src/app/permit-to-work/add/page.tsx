"use client";

import { useState } from "react";
import Link from "next/link";
import { PERMIT_TYPES, PERMIT_STATUSES } from "@/lib/site-safety";

export default function AddPermitToWorkPage() {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    permitNumber: "",
    permitType: "general",
    title: "",
    workDescription: "",
    department: "",
    location: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    hazards: "",
    controls: "",
    status: "draft",
    issuerName: "",
    receiverName: "",
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
      const res = await fetch("/api/permit-to-work/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) { alert(json.error ?? "Upload failed"); return; }
      if (json.url) setForm((prev) => ({ ...prev, fileUrl: json.url }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/permit-to-work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        fileUrl: form.fileUrl || null,
        endDate: form.endDate || null,
        permitNumber: form.permitNumber || null,
      }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? "Failed to save");
      return;
    }
    window.location.href = "/permit-to-work/list";
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/permit-to-work" className="button button-neutral">Back</Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Issue Permit to Work</h1>
        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Permit number</label>
              <input name="permitNumber" value={form.permitNumber} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Permit type *</label>
              <select name="permitType" value={form.permitType} onChange={handleChange} required className="w-full p-3 rounded-lg border border-white/40 bg-white/70">
                {PERMIT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Work description</label>
            <textarea name="workDescription" value={form.workDescription} onChange={handleChange} rows={3} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Department</label>
              <input name="department" value={form.department} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Start date *</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">End date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Hazards identified</label>
            <textarea name="hazards" value={form.hazards} onChange={handleChange} rows={2} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Controls in place</label>
            <textarea name="controls" value={form.controls} onChange={handleChange} rows={2} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70">
                {PERMIT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Issuer</label>
              <input name="issuerName" value={form.issuerName} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Receiver</label>
              <input name="receiverName" value={form.receiverName} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Attachment</label>
            <input type="file" accept="application/pdf,image/*" onChange={handleFile} />
            {uploading && <p className="text-sm text-blue-700 mt-1">Uploading…</p>}
          </div>
          <button type="submit" disabled={uploading} className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">Save Permit</button>
        </form>
      </div>
    </div>
  );
}
