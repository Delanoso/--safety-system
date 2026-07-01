"use client";

import { useState } from "react";
import Link from "next/link";
import PersonAutocomplete, { type CompanyPersonRecord } from "@/components/PersonAutocomplete";
import { DRILL_STATUSES, DRILL_TYPES } from "@/lib/emergency-drills";

export default function AddEmergencyDrillPage() {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    drillType: "fire_evacuation",
    title: "",
    drillDate: new Date().toISOString().split("T")[0],
    location: "",
    department: "",
    coordinator: "",
    participantCount: "",
    durationMinutes: "",
    findings: "",
    correctiveActions: "",
    status: "completed",
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
      const res = await fetch("/api/emergency-drills/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) { alert(json.error ?? "Upload failed"); return; }
      if (json.url) setForm((prev) => ({ ...prev, fileUrl: json.url }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/emergency-drills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        fileUrl: form.fileUrl || null,
        participantCount: form.participantCount || null,
        durationMinutes: form.durationMinutes || null,
      }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? "Failed to save");
      return;
    }
    window.location.href = "/emergency-drills/list";
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/emergency-drills" className="button button-neutral">Back</Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Record Emergency Drill</h1>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Drill type *</label>
              <select name="drillType" value={form.drillType} onChange={handleChange} required className="w-full p-3 rounded-lg border border-white/40 bg-white/70">
                {DRILL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70">
                {DRILL_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Q2 Fire Evacuation Drill" className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Drill date *</label>
              <input type="date" name="drillDate" value={form.drillDate} onChange={handleChange} required className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Duration (minutes)</label>
              <input type="number" name="durationMinutes" value={form.durationMinutes} onChange={handleChange} min={1} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Department</label>
              <input name="department" value={form.department} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
          </div>

          <PersonAutocomplete
            label="Search coordinator"
            onSelect={(person: CompanyPersonRecord) => {
              const name = [person.name, person.surname].filter(Boolean).join(" ");
              setForm((prev) => ({
                ...prev,
                coordinator: name,
                department: person.department ?? prev.department,
              }));
            }}
          />
          <div>
            <label className="block text-sm font-semibold mb-1">Coordinator</label>
            <input name="coordinator" value={form.coordinator} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Number of participants</label>
            <input type="number" name="participantCount" value={form.participantCount} onChange={handleChange} min={0} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Findings / observations</label>
            <textarea name="findings" value={form.findings} onChange={handleChange} rows={3} placeholder="What went well? What issues were identified?" className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Corrective actions</label>
            <textarea name="correctiveActions" value={form.correctiveActions} onChange={handleChange} rows={3} placeholder="Actions to address gaps from the drill" className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Attachment (photos, attendance register, report)</label>
            <input type="file" accept="application/pdf,image/*" onChange={handleFile} />
            {uploading && <p className="text-sm text-blue-700 mt-1">Uploading…</p>}
          </div>

          <button type="submit" disabled={uploading} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            Save Emergency Drill
          </button>
        </form>
      </div>
    </div>
  );
}
