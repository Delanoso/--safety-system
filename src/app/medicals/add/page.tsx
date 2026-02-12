"use client";

import { useState } from "react";

const MEDICAL_TYPES = [
  "Baseline Medical",
  "Routine / Annual Medical",
  "Exit Medical",
  "General Medical Assessment",
  "Fitness for Duty",
  "Pre-Employment Medical",
  "Audiometry (Hearing)",
  "Vision / Eye Test",
  "Spirometry (Lung Function)",
  "Chest X-Ray",
  "Food Handler Medical",
  "Construction Medical",
  "Psychological Assessment",
  "Biological Monitoring / Medical Surveillance",
  "Other",
];

export default function AddMedicalPage() {
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    employee: "",
    medicalType: "",
    issueDate: "",
    expiryDate: "",
    notes: "",
    fileUrl: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
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

      const res = await fetch("/api/medicals/upload", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let json: { url?: string; error?: string } = {};
      try {
        json = JSON.parse(text);
      } catch {
        // response was not JSON
      }

      if (!res.ok) {
        alert(typeof json.error === "string" ? json.error : text || "Upload failed.");
        setUploading(false);
        return;
      }

      if (json.url) {
        setForm((prev) => ({ ...prev, fileUrl: json.url! }));
      }
    } catch {
      alert("Upload failed. Check your connection and try again.");
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fileUrl =
      typeof form.fileUrl === "string" && form.fileUrl.trim()
        ? form.fileUrl.trim()
        : null;

    const payload = {
      employee: form.employee,
      medicalType: form.medicalType,
      issueDate: form.issueDate,
      expiryDate: form.expiryDate,
      notes: form.notes,
      fileUrl,
    };

    const res = await fetch("/api/medicals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      let errMsg = "Failed to save medical.";
      try {
        const err = JSON.parse(text) as { error?: string };
        if (typeof err?.error === "string") errMsg = err.error;
      } catch {
        if (text) errMsg = text;
      }
      alert(errMsg);
      return;
    }

    alert("Medical saved successfully!");
    window.location.href = "/medicals/list";
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-3xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-black">Add Medical</h1>
        <p className="text-black/70">Record a new medical examination for an employee.</p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40"
        >
          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Employee Name
            </label>
            <input
              type="text"
              name="employee"
              value={form.employee}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Medical Type
            </label>
            <select
              name="medicalType"
              value={form.medicalType}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70 text-black"
              required
            >
              <option value="">Select medical type...</option>
              {MEDICAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Issue Date
            </label>
            <input
              type="date"
              name="issueDate"
              value={form.issueDate}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Upload Document (PDF or Image)
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={handleFile}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
            {uploading && (
              <p className="text-sm text-blue-700 mt-1">Uploading...</p>
            )}
            {form.fileUrl ? (
              <p className="text-sm text-green-700 mt-1">
                Uploaded successfully — document will be saved with this record.
              </p>
            ) : (
              <p className="text-sm text-black/50 mt-1">
                Optional. Choose a PDF or image; you must see &quot;Uploaded successfully&quot; before saving if you want to attach a file.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {uploading ? "Please wait..." : "Save Medical"}
          </button>
        </form>
      </div>
    </div>
  );
}
