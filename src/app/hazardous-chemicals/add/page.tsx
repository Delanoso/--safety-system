"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export default function AddHazardousChemicalPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    casNumber: "",
    location: "",
    quantity: "",
    unit: "",
    sdsUrl: "",
    hazardClass: "",
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "sdsUrl") setUploadedFileName(null);
  }

  async function handleSdsUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or image (JPEG, PNG, GIF, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be under 10 MB.");
      return;
    }
    setUploading(true);
    setUploadedFileName(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/hazardous-chemicals/upload-sds", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      setForm((prev) => ({ ...prev, sdsUrl: data.url }));
      setUploadedFileName(file.name);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/hazardous-chemicals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        casNumber: form.casNumber.trim() || null,
        location: form.location.trim() || null,
        quantity: form.quantity.trim() || null,
        unit: form.unit.trim() || null,
        sdsUrl: form.sdsUrl.trim() || null,
        hazardClass: form.hazardClass.trim() || null,
        notes: form.notes.trim() || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "Failed to save");
      return;
    }

    alert("Chemical added to register successfully!");
    window.location.href = "/hazardous-chemicals";
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-3xl mx-auto space-y-10">
        <Link href="/hazardous-chemicals" className="text-black/70 hover:text-black">
          ← Hazardous Chemicals
        </Link>

        <h1 className="text-4xl font-bold text-black">Add Hazardous Chemical</h1>
        <p className="text-black/70">Add a chemical to the hazardous substances register.</p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40"
        >
          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Chemical Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Sulphuric Acid"
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              CAS Number (optional)
            </label>
            <input
              type="text"
              name="casNumber"
              value={form.casNumber}
              onChange={handleChange}
              placeholder="e.g. 7664-93-9"
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Storage Location
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Store Room B"
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Hazard Class
              </label>
              <input
                type="text"
                name="hazardClass"
                value={form.hazardClass}
                onChange={handleChange}
                placeholder="e.g. Corrosive, Flammable"
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Quantity
              </label>
              <input
                type="text"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="e.g. L, kg"
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-black mb-1">
              SDS / Safety Data Sheet
            </label>
            <p className="text-sm text-black/70">
              Paste a URL or upload a PDF / image document.
            </p>
            <input
              type="url"
              name="sdsUrl"
              value={form.sdsUrl}
              onChange={handleChange}
              placeholder="https://... (or upload below)"
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <label className="cursor-pointer px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium border border-blue-200 transition">
                {uploading ? "Uploading…" : "Upload PDF or image"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleSdsUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {uploadedFileName && (
                <span className="text-sm text-green-700 font-medium">
                  ✓ {uploadedFileName}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          <button type="submit" className="button button-save w-full py-3">
            Add to Register
          </button>
        </form>
      </div>
    </div>
  );
}
