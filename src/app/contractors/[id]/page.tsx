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
  Download,
  Save,
} from "lucide-react";
import { CONTRACTOR_SECTIONS } from "@/lib/contractor-sections";
import { getApplicableSections } from "@/lib/contractor-compliance";
import ContractorSectionSelector, { excludedFromContractor } from "@/components/contractors/ContractorSectionSelector";
import type { ContractorSectionId } from "@/lib/contractor-sections";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { openWhatsAppLink } from "@/lib/open-whatsapp";
import { downloadPdf } from "@/lib/pdf-download";

type Document = {
  id: string;
  section: string;
  fileName: string;
  fileUrl: string;
  uploadedByContractor: boolean;
};

type Compliance = {
  applicableCount: number;
  completeCount: number;
  excludedCount: number;
  percentage: number;
};

type Contractor = {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  scope: string;
  jobDescription: string | null;
  uploadToken: string;
  excludedSections: string | null;
  documents: Document[];
  compliance?: Compliance;
};

export default function ContractorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [linkCopied, setLinkCopied] = useState(false);
  const [excludedSections, setExcludedSections] = useState<ContractorSectionId[]>([]);
  const [savingSections, setSavingSections] = useState(false);
  const [sectionsDirty, setSectionsDirty] = useState(false);

  async function load() {
    const res = await fetch(`/api/contractors/${id}`);
    if (!res.ok) {
      setContractor(null);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setContractor(data);
    setExcludedSections(excludedFromContractor(data.excludedSections));
    setSectionsDirty(false);
    setLoading(false);
  }

  useEffect(() => {
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

  function sendUploadLinkWhatsApp() {
    const phone = contractor?.contactPhone?.trim();
    if (!phone) {
      alert("No contractor phone number on file. Add a phone number when creating the contractor.");
      return;
    }
    if (!uploadLink) return;
    const message = `Hi ${contractor?.name}, please upload your safety file documents here: ${uploadLink}`;
    try {
      openWhatsAppLink(buildWhatsAppUrl(phone, message));
    } catch {
      alert("Invalid contractor phone number.");
    }
  }

  async function saveSections() {
    if (!contractor) return;
    setSavingSections(true);
    const res = await fetch(`/api/contractors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ excludedSections }),
    });
    if (res.ok) {
      const data = await res.json();
      setContractor(data);
      setExcludedSections(excludedFromContractor(data.excludedSections));
      setSectionsDirty(false);
    } else {
      alert("Failed to save section settings");
    }
    setSavingSections(false);
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
        setContractor((prev) => {
          if (!prev) return null;
          const compliance = prev.compliance
            ? {
                ...prev.compliance,
                completeCount: new Set([...prev.documents, doc].map((d) => d.section)).size,
              }
            : prev.compliance;
          return {
            ...prev,
            documents: [...prev.documents, doc],
            compliance,
          };
        });
        await load();
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
    await load();
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

  const compliance = contractor.compliance;
  const applicableSections = getApplicableSections(excludedSections);
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-black">{contractor.name}</h1>
              <p className="text-black/70 mt-1">
                {contractor.scope === "specific_job" ? "Specific Job" : "Ongoing"} •{" "}
                {contractor.contactEmail ?? contractor.contactPhone ?? "No contact"}
              </p>
              {contractor.jobDescription && (
                <p className="text-black/70 mt-2 text-sm">{contractor.jobDescription}</p>
              )}
            </div>
            {compliance && (
              <div className="text-right">
                <p
                  className={`text-3xl font-bold ${
                    compliance.percentage >= 80
                      ? "text-green-700"
                      : compliance.percentage >= 50
                        ? "text-orange-600"
                        : "text-red-600"
                  }`}
                >
                  {compliance.percentage}%
                </p>
                <p className="text-sm text-black/60">
                  {compliance.completeCount}/{compliance.applicableCount} applicable sections
                </p>
                {compliance.excludedCount > 0 && (
                  <p className="text-xs text-black/50">{compliance.excludedCount} marked N/A</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={sendUploadLinkWhatsApp}
              className="button button-save flex items-center gap-2"
            >
              <Copy size={18} />
              Send upload link via WhatsApp
            </button>
            <button
              onClick={copyLink}
              className="button button-neutral flex items-center gap-2"
            >
              {linkCopied ? <Check size={18} /> : <Copy size={18} />}
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
            <button
              type="button"
              onClick={() => downloadPdf("contractor-safety-file", contractor.id)}
              className="button button-neutral flex items-center gap-2"
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6 space-y-4">
          <ContractorSectionSelector
            excluded={excludedSections}
            onChange={(next) => {
              setExcludedSections(next);
              setSectionsDirty(true);
            }}
          />
          {sectionsDirty && (
            <button
              type="button"
              onClick={saveSections}
              disabled={savingSections}
              className="button button-save flex items-center gap-2"
            >
              <Save size={16} />
              {savingSections ? "Saving…" : "Save section settings"}
            </button>
          )}
        </div>

        <h2 className="text-xl font-semibold text-black">Safety file sections</h2>
        <p className="text-black/70 -mt-4">
          Upload documents on behalf of the contractor or send them the upload link via WhatsApp.
          Only applicable sections are shown below.
        </p>

        <div className="space-y-6">
          {applicableSections.map(({ id: sectionId, label }) => {
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

        {excludedSections.length > 0 && (
          <div className="rounded-xl border border-white/40 bg-white/40 p-4">
            <p className="text-sm font-medium text-black/70 mb-2">Sections marked not applicable</p>
            <ul className="text-sm text-black/50 space-y-1">
              {CONTRACTOR_SECTIONS.filter((s) => excludedSections.includes(s.id)).map((s) => (
                <li key={s.id}>• {s.label}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
