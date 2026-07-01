"use client";

import { useState } from "react";
import Link from "next/link";
import PersonAutocomplete, { type CompanyPersonRecord } from "@/components/PersonAutocomplete";
import ToolboxAttendeeEditor from "@/components/toolbox-talks/ToolboxAttendeeEditor";
import type { ToolboxAttendeeDraft } from "@/lib/toolbox-talk-attendees";

export default function AddToolboxTalkPage() {
  const [uploading, setUploading] = useState(false);
  const [attendees, setAttendees] = useState<ToolboxAttendeeDraft[]>([]);
  const [form, setForm] = useState({
    title: "",
    topic: "",
    department: "",
    location: "",
    presenter: "",
    talkDate: new Date().toISOString().split("T")[0],
    durationMinutes: "",
    notes: "",
    fileUrl: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/toolbox-talks/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? "Upload failed");
        return;
      }
      if (json.url) setForm((prev) => ({ ...prev, fileUrl: json.url }));
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/toolbox-talks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        fileUrl: form.fileUrl || null,
        durationMinutes: form.durationMinutes || null,
        attendees,
      }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? "Failed to save");
      return;
    }
    window.location.href = "/toolbox-talks/list";
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex gap-2">
          <Link href="/toolbox-talks" className="button button-neutral">
            Back
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Record Toolbox Talk</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6 sm:p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-visible"
        >
          <div>
            <label className="block text-sm font-semibold mb-1">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Topic</label>
            <input
              name="topic"
              value={form.topic}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Date *</label>
              <input
                type="date"
                name="talkDate"
                value={form.talkDate}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Duration (minutes)</label>
              <input
                type="number"
                name="durationMinutes"
                value={form.durationMinutes}
                onChange={handleChange}
                min={1}
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
          </div>
          <div>
            <PersonAutocomplete
              label="Search presenter"
              onSelect={(person: CompanyPersonRecord) => {
                const name = [person.name, person.surname].filter(Boolean).join(" ");
                setForm((prev) => ({ ...prev, presenter: name }));
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Presenter</label>
            <input
              name="presenter"
              value={form.presenter}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
          </div>

          <ToolboxAttendeeEditor attendees={attendees} onChange={setAttendees} />

          <div>
            <label className="block text-sm font-semibold mb-1">Attachment (optional)</label>
            <input type="file" accept="application/pdf,image/*" onChange={handleFile} />
            {uploading && <p className="text-sm text-blue-700 mt-1">Uploading…</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            Save Toolbox Talk
          </button>
        </form>
      </div>
    </div>
  );
}
