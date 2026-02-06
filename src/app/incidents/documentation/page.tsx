"use client";

import { useState } from "react";

export default function DocumentationPage() {
  const [form, setForm] = useState({
    linkId: "",
    incidentId: "",
    title: "",
    fileName: "",
    fileType: "",
    filePath: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/incidents/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        linkId: form.linkId || null,
        incidentId: form.incidentId || null,
      }),
    });

    if (!res.ok) {
      setMessage("Failed to save document metadata.");
    } else {
      setMessage("Document metadata saved.");
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 dark:bg-[#0f172a]">
      <div className="max-w-3xl mx-auto bg-white/40 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/30">
        <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">
          Relevant Documentation
        </h1>
        <p className="text-black/70 dark:text-white/70 mb-6">
          For now, this page stores metadata for Excel/PDF documents. Later we can wire real file uploads.
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
                placeholder="Shared ID with incident/cost analysis"
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
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-black dark:text-white mb-1">
              Document Title
            </label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
              placeholder="e.g. Incident Investigation Form"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-black dark:text-white mb-1">
                File Name
              </label>
              <input
                value={form.fileName}
                onChange={(e) => update("fileName", e.target.value)}
                className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
                placeholder="incident_form_2025.pdf"
              />
            </div>

            <div>
              <label className="block font-medium text-black dark:text-white mb-1">
                File Type
              </label>
              <input
                value={form.fileType}
                onChange={(e) => update("fileType", e.target.value)}
                className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
                placeholder="application/pdf, application/vnd.ms-excel"
              />
            </div>

            <div>
              <label className="block font-medium text-black dark:text-white mb-1">
                File Path
              </label>
              <input
                value={form.filePath}
                onChange={(e) => update("filePath", e.target.value)}
                className="w-full p-3 rounded-lg bg-white/70 border border-white/30 shadow text-black"
                placeholder="/uploads/incident_form_2025.pdf"
              />
            </div>
          </div>

          {message && (
            <p className="text-sm mt-2 text-black dark:text-white">{message}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Document Metadata"}
          </button>
        </form>
      </div>
    </div>
  );
}

