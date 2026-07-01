"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Download,
  ExternalLink,
  FileText,
  FolderPlus,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

type Division = {
  id: string;
  name: string;
  createdAt: string;
  _count?: { documents: number };
};

type CompanyDoc = {
  id: string;
  name: string;
  fileUrl: string;
  mimeType?: string | null;
  size?: number | null;
  createdAt: string;
  uploadedBy?: { email: string } | null;
};

function fileIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "📄";
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "📝";
  return "📁";
}

function formatSize(size?: number | null) {
  if (!size || size <= 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CompanyDocumentsPage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [documents, setDocuments] = useState<CompanyDoc[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [newDivisionName, setNewDivisionName] = useState("");
  const [divisionSearch, setDivisionSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDivisions() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/company-documents/divisions");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to load divisions");
      setDivisions([]);
    } else {
      setDivisions(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }

  async function loadDocuments(divisionId: string) {
    setSelectedDivision(divisionId);
    const res = await fetch(`/api/company-documents?divisionId=${divisionId}`);
    const data = await res.json();
    setDocuments(res.ok && Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadDivisions();
  }, []);

  async function createDivision() {
    const name = newDivisionName.trim();
    if (!name) return;

    setCreating(true);
    setError(null);
    const res = await fetch("/api/company-documents/divisions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setCreating(false);

    if (!res.ok) {
      setError(data.error || "Could not create division");
      return;
    }

    setNewDivisionName("");
    await loadDivisions();
    if (data.id) loadDocuments(data.id);
  }

  async function deleteDivision(id: string) {
    if (!confirm("Delete this division and all its documents?")) return;
    await fetch(`/api/company-documents/divisions/${id}`, { method: "DELETE" });
    if (selectedDivision === id) {
      setSelectedDivision(null);
      setDocuments([]);
    }
    loadDivisions();
  }

  async function uploadFiles(fileList: FileList | null) {
    if (!selectedDivision || !fileList?.length) return;

    setUploading(true);
    setError(null);

    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("divisionId", selectedDivision);

      const res = await fetch("/api/company-documents", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    loadDocuments(selectedDivision);
    loadDivisions();
  }

  async function deleteDocument(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/company-documents/${id}`, { method: "DELETE" });
    if (selectedDivision) loadDocuments(selectedDivision);
    loadDivisions();
  }

  const filteredDivisions = divisions
    .filter((d) => d.name.toLowerCase().includes(divisionSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const selectedDivisionName =
    divisions.find((d) => d.id === selectedDivision)?.name ?? "";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="text-[var(--gold)]" />
            Company Documents
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Create divisions (e.g. Workshop, Admin, Policies) and share PDF or Word
            documents with everyone in your company.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/20 border border-red-400/40 text-red-100 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Divisions</h2>

          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 rounded-lg bg-white/15 border border-white/20 px-3 py-2 text-white placeholder:text-white/50"
              placeholder="e.g. Workshop, Admin, Policies"
              value={newDivisionName}
              onChange={(e) => setNewDivisionName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createDivision()}
            />
            <button
              type="button"
              onClick={createDivision}
              disabled={creating || !newDivisionName.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--gold)] text-black font-medium hover:opacity-90 disabled:opacity-50"
            >
              {creating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FolderPlus size={16} />
              )}
              Add
            </button>
          </div>

          <input
            className="w-full rounded-lg bg-white/15 border border-white/20 px-3 py-2 text-white placeholder:text-white/50 mb-4"
            placeholder="Search divisions..."
            value={divisionSearch}
            onChange={(e) => setDivisionSearch(e.target.value)}
          />

          {loading ? (
            <p className="text-white/60 text-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading...
            </p>
          ) : filteredDivisions.length === 0 ? (
            <p className="text-white/60 text-sm">
              No divisions yet. Create one to start uploading documents.
            </p>
          ) : (
            <ul className="space-y-2 max-h-[55vh] overflow-y-auto">
              {filteredDivisions.map((division) => (
                <li
                  key={division.id}
                  className={`rounded-lg px-3 py-2 flex items-center justify-between gap-2 cursor-pointer transition ${
                    selectedDivision === division.id
                      ? "bg-[var(--gold)]/25 border border-[var(--gold)]/50"
                      : "bg-white/10 hover:bg-white/15"
                  }`}
                  onClick={() => loadDocuments(division.id)}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{division.name}</p>
                    <p className="text-xs text-white/60">
                      {division._count?.documents ?? 0} document
                      {(division._count?.documents ?? 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDivision(division.id);
                    }}
                    className="p-1.5 rounded text-red-300 hover:bg-red-500/20 shrink-0"
                    title="Delete division"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:flex-1 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5">
          <h2 className="text-lg font-semibold text-white mb-1">Documents</h2>
          {selectedDivision ? (
            <p className="text-sm text-white/60 mb-4">{selectedDivisionName}</p>
          ) : (
            <p className="text-sm text-white/60 mb-4">
              Select a division to view and upload files.
            </p>
          )}

          {selectedDivision && (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white cursor-pointer hover:bg-purple-700 transition">
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {uploading ? "Uploading..." : "Upload documents"}
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      uploadFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                <span className="text-xs text-white/60">
                  PDF and Word (.doc, .docx) only
                </span>
              </div>

              <div
                onDrop={(e) => {
                  e.preventDefault();
                  uploadFiles(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-white/30 rounded-xl p-6 text-center text-sm text-white/70 mb-4"
              >
                Drag and drop PDF or Word files here
              </div>
            </>
          )}

          <ul className="space-y-2 max-h-[50vh] overflow-y-auto">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="rounded-lg bg-white/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span>{fileIcon(doc.name)}</span>
                    <span className="font-medium text-white truncate">{doc.name}</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {formatSize(doc.size)}
                    {doc.createdAt &&
                      ` · ${new Date(doc.createdAt).toLocaleDateString()}`}
                    {doc.uploadedBy?.email && ` · ${doc.uploadedBy.email}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    <ExternalLink size={14} />
                    View
                  </a>
                  <a
                    href={doc.fileUrl}
                    download={doc.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
                  >
                    <Download size={14} />
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteDocument(doc.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 text-white text-sm hover:bg-red-700"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {selectedDivision && documents.length === 0 && !uploading && (
            <div className="text-center py-10 text-white/50">
              <FileText size={40} className="mx-auto mb-3 opacity-50" />
              <p>No documents in this division yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
