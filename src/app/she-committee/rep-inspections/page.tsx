"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Upload, Plus } from "lucide-react";
import { getPdfDownloadUrl } from "@/lib/pdf-download";
import {
  SHE_REP_INSPECTION_DOC_NUMBER,
  SHE_REP_INSPECTION_TEMPLATE_PATH,
} from "@/lib/she-rep-inspection";

type Inspection = {
  id: string;
  title: string;
  period: string | null;
  status: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
  uploadedAt: string | null;
};

export default function SHERepInspectionsPage() {
  const [items, setItems] = useState<Inspection[]>([]);
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState("");
  const [creating, setCreating] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function parseJson(res: Response) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  async function load() {
    try {
      const res = await fetch("/api/she-rep-inspections", { cache: "no-store" });
      const data = await parseJson(res);
      if (!res.ok) {
        setError(data?.error || "Failed to load inspections");
        return;
      }
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load inspections");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/she-rep-inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), period: period.trim() || null }),
      });
      const data = await parseJson(res);
      if (!res.ok) throw new Error(data?.error || "Failed to create");
      setTitle("");
      setPeriod("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpload(id: string, file: File) {
    setUploadingId(id);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("file", file);
      const res = await fetch("/api/she-rep-inspections", {
        method: "PATCH",
        body: formData,
      });
      const data = await parseJson(res);
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-blue-200 to-purple-300 min-w-0">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/she-committee" className="button button-neutral inline-flex items-center gap-2">
          <ArrowLeft size={18} />
          SHE Committee
        </Link>

        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-black">SHE Rep Inspections</h1>
          <p className="text-black/70 mt-2 text-sm sm:text-base">
            Use form {SHE_REP_INSPECTION_DOC_NUMBER} — download the blank checklist for SHE reps,
            complete it, then upload the signed document.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form
          onSubmit={handleCreate}
          className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 sm:p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-black flex items-center gap-2">
            <Plus size={20} />
            New inspection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full p-3 rounded-lg border bg-white/70"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Workshop monthly inspection"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Period (optional)</label>
              <input
                className="w-full p-3 rounded-lg border bg-white/70"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. March 2026"
              />
            </div>
          </div>
          <button type="submit" disabled={creating} className="button button-save px-5 py-2">
            {creating ? "Creating…" : "Create inspection"}
          </button>
        </form>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 sm:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-black">Inspection records</h2>
          {items.length === 0 ? (
            <p className="text-black/60 text-sm">No inspections yet. Create one above.</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-white/50 bg-white/50 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-black">{item.title}</p>
                      {item.period && (
                        <p className="text-sm text-black/60">Period: {item.period}</p>
                      )}
                      <p className="text-xs text-black/50 mt-1">
                        Created {new Date(item.createdAt).toLocaleDateString()}
                        {item.uploadedAt &&
                          ` · Uploaded ${new Date(item.uploadedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status === "completed" ? "Completed" : "Pending upload"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={SHE_REP_INSPECTION_TEMPLATE_PATH}
                      download
                      className="button button-pdf inline-flex items-center gap-2 text-sm"
                    >
                      <Download size={16} />
                      Download blank form (Word)
                    </a>

                    <a
                      href={getPdfDownloadUrl("she-rep-inspection", item.id)}
                      className="button button-neutral inline-flex items-center gap-2 text-sm"
                    >
                      <Download size={16} />
                      Download PDF copy
                    </a>

                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-neutral inline-flex items-center gap-2 text-sm"
                      >
                        View uploaded file
                      </a>
                    )}

                    <label className="button button-save inline-flex items-center gap-2 text-sm cursor-pointer">
                      <Upload size={16} />
                      {uploadingId === item.id ? "Uploading…" : "Upload completed"}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        disabled={uploadingId === item.id}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(item.id, f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
