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

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const data = new FormData();
    data.append("file", file);
    data.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    // ⭐ FIXED: use /auto/upload so PDFs AND images work
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const json = await res.json();

    setForm((prev) => ({
      ...prev,
      fileUrl: json.secure_url, // ⭐ ALWAYS defined now
    }));

    setUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      employee: form.employee,
      certificateName: form.certificateName,
      certificateType: form.certificateType,
      issueDate: form.issueDate,
      expiryDate: form.expiryDate,
      notes: form.notes,
      fileUrl: form.fileUrl || null,
    };

    await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // ⭐ REQUIRED FIX
      body: JSON.stringify(payload),
    });

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

            {form.fileUrl && (
              <p className="text-sm text-green-700 mt-1">
                Uploaded successfully
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

