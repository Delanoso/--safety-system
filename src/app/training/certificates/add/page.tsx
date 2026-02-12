"use client";

import { useState } from "react";

export default function AddCertificatePage() {
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    employee: "",
    certificateName: "",
    certificateType: "",
    issueDate: "",
    expiryDate: "",
    notes: "",
    fileUrl: "",
  });

  function handleChange(e) {
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

      const res = await fetch("/api/certificates/upload", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let json: { url?: string; error?: string } = {};
      try {
        json = JSON.parse(text);
      } catch {
        // response was not JSON (e.g. HTML error page)
      }

      if (!res.ok) {
        alert(typeof json.error === "string" ? json.error : text || "Upload failed.");
        setUploading(false);
        return;
      }

      if (json.url) {
        setForm((prev) => ({ ...prev, fileUrl: json.url }));
      }
    } catch {
      alert("Upload failed. Check your connection and try again.");
    }
    setUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const fileUrl =
      typeof form.fileUrl === "string" && form.fileUrl.trim()
        ? form.fileUrl.trim()
        : null;

    const payload = {
      employee: form.employee,
      certificateName: form.certificateName,
      certificateType: form.certificateType,
      issueDate: form.issueDate,
      expiryDate: form.expiryDate,
      notes: form.notes,
      fileUrl,
    };

    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to save certificate.");
      return;
    }

    alert("Certificate saved successfully!");
    window.location.href = "/training/certificates/list";
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-3xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-black">Add Certificate</h1>
        <p className="text-black/70">Upload a new certificate for an employee.</p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40"
        >
          {/* EMPLOYEE */}
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

          {/* CERTIFICATE NAME */}
          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Certificate Name
            </label>
            <input
              type="text"
              name="certificateName"
              value={form.certificateName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              required
            />
          </div>

          {/* CERTIFICATE TYPE */}
          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Certificate Type
            </label>
            <input
              type="text"
              name="certificateType"
              value={form.certificateType}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          {/* ISSUE DATE */}
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

          {/* EXPIRY DATE */}
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

          {/* FILE UPLOAD */}
          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Upload Certificate (PDF or Image)
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
                Uploaded successfully — document will be saved with this certificate.
              </p>
            ) : (
              <p className="text-sm text-black/50 mt-1">
                Choose a PDF or image; you must see &quot;Uploaded successfully&quot; before saving.
              </p>
            )}
          </div>

          {/* NOTES */}
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

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {uploading ? "Please wait..." : "Save Certificate"}
          </button>
        </form>
      </div>
    </div>
  );
}

