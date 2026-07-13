"use client";

import { useRef, useState } from "react";

export type HazardousChemicalFormValues = {
  name: string;
  casNumber: string;
  location: string;
  quantity: string;
  unit: string;
  sdsUrl: string;
  hazardClass: string;
  notes: string;
};

type HazardousChemicalFormProps = {
  initial?: Partial<HazardousChemicalFormValues>;
  submitLabel: string;
  onSubmit: (values: HazardousChemicalFormValues) => Promise<void>;
};

export default function HazardousChemicalForm({
  initial,
  submitLabel,
  onSubmit,
}: HazardousChemicalFormProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<HazardousChemicalFormValues>({
    name: initial?.name ?? "",
    casNumber: initial?.casNumber ?? "",
    location: initial?.location ?? "",
    quantity: initial?.quantity ?? "",
    unit: initial?.unit ?? "",
    sdsUrl: initial?.sdsUrl ?? "",
    hazardClass: initial?.hazardClass ?? "",
    notes: initial?.notes ?? "",
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
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        casNumber: form.casNumber.trim(),
        location: form.location.trim(),
        quantity: form.quantity.trim(),
        unit: form.unit.trim(),
        sdsUrl: form.sdsUrl.trim(),
        hazardClass: form.hazardClass.trim(),
        notes: form.notes.trim(),
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  }

  return (
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
        {form.sdsUrl && (
          <a
            href={form.sdsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline inline-block"
          >
            View current SDS
          </a>
        )}
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

      <button type="submit" disabled={saving} className="button button-save w-full py-3">
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
