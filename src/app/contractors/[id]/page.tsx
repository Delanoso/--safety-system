"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Link2,
  Trash2,
  Upload,
  FileText,
  ExternalLink,
  Check,
} from "lucide-react";
import { CONTRACTOR_SECTIONS } from "@/lib/contractor-sections";

type Document = {
  id: string;
  section: string;
  fileName: string;
  fileUrl: string;
  uploadedByContractor: boolean;
};

type Contractor = {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  scope: string;
  jobDescription: string | null;
  uploadToken: string;
  documents: Document[];
};

export default function ContractorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/contractors/${id}`);
      if (!res.ok) {
        setContractor(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setContractor(data);
      setLoading(false);
    }
    load();
  }, [id]);

  const uploadLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/contractors/upload?token=${contractor?.uploadToken ?? ""}`
      : "";

  async function copyLink() {
    if (!uploadLink) return;
    await navigator.clipboard.writeText(uploadLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  async function handleUpload(section: string, files: FileList | null) {
    if (!files?.length || !contractor) return;
    setUploading((prev) => ({ ...prev, [section]: true }));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("section", section);

      const res = await fetch(`/api/contractors/${id}/documents`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const doc = await res.json();
        setContractor((prev) =>
          prev ? { ...prev, documents: [...prev.documents, doc] } : null
        );
      }
    }

    setUploading((prev) => ({ ...prev, [section]: false }));
  }

  async function handleDeleteDoc(docId: string) {
    if (!confirm("Delete this document?")) return;
    const res = await fetch(`/api/contractors/${id}/documents/${docId}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    setContractor((prev) =>
      prev
        ? { ...prev, documents: prev.documents.filter((d) => d.id !== docId) }
        : null
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-amber-100 to-orange-200 flex items-center justify-center">
        <div className="text-black/70">Loading...</div>
      </div>
    );
  }
  if (!contractor) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-amber-100 to-orange-200">
        <div className="max-w-4xl mx-auto">
          <Link href="/contractors" className="text-black/70 hover:text-black">
            ← Contractors
          </Link>
          <p className="mt-4 text-red-600">Contractor not found.</p>
        </div>
      </div>
    );
  }

  const docsBySection: Record<string, Document[]> = {};
  contractor.documents.forEach((d) => {
    if (!docsBySection[d.section]) docsBySection[d.section] = [];
    docsBySection[d.section].push(d);
  });

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/contractors" className="text-black/70 hover:text-black flex items-center gap-2">
            <ArrowLeft size={18} />
            Contractors
          </Link>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
          <h1 className="text-2xl font-bold text-black">{contractor.name}</h1>
          <p className="text-black/70 mt-1">
            {contractor.scope === "specific_job" ? "Specific Job" : "Ongoing"} •{" "}
            {contractor.contactEmail ?? contractor.contactPhone ?? "No contact"}
          </p>
          {contractor.jobDescription && (
            <p className="text-black/70 mt-2 text-sm">{contractor.jobDescription}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={copyLink}
              className="button button-save flex items-center gap-2"
            >
              {linkCopied ? (
                <Check size={18} />
              ) : (
                <Copy size={18} />
              )}
              {linkCopied ? "Copied!" : "Copy upload link"}
            </button>
            <a
              href={uploadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-neutral flex items-center gap-2"
            >
              <Link2 size={18} />
              Open upload page
            </a>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-black">Safety file sections</h2>
        <p className="text-black/70 -mt-4">
          Upload documents on behalf of the contractor or send them the link above to upload themselves.
        </p>

        <div className="space-y-6">
          {CONTRACTOR_SECTIONS.map(({ id: sectionId, label }) => {
            const docs = docsBySection[sectionId] ?? [];
            const isUploading = uploading[sectionId];

            return (
              <div
                key={sectionId}
                className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6"
              >
                <h3 className="font-semibold text-black mb-4">{label}</h3>

                <div className="flex flex-wrap gap-2 mb-4">
                  <label className="cursor-pointer">
                    <span className="button button-save inline-flex items-center gap-2 px-4 py-2">
                      <Upload size={16} />
                      {isUploading ? "Uploading..." : "Upload file(s)"}
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        const files = e.target.files;
                        handleUpload(sectionId, files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                {docs.length > 0 ? (
                  <ul className="space-y-2">
                    {docs.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/50"
                      >
                        <FileText size={18} className="text-black/60" />
                        <span className="flex-1 truncate">{d.fileName}</span>
                        {d.uploadedByContractor && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Contractor
                          </span>
                        )}
                        <a
                          href={d.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          title="Open"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => handleDeleteDoc(d.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-black/50 text-sm">No documents uploaded yet.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
