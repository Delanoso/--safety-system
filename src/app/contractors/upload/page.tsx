"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Upload, FileText, Loader2, CheckCircle } from "lucide-react";
import { CONTRACTOR_SECTIONS } from "@/lib/contractor-sections";

type Document = {
  id: string;
  section: string;
  fileName: string;
  fileUrl: string;
  uploadedByContractor: boolean;
};

type ContractorInfo = {
  id: string;
  name: string;
  scope: string;
  jobDescription: string | null;
  documents: Document[];
};

function ContractorUploadContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [info, setInfo] = useState<ContractorInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!token) {
      setError("No upload token provided. Please use the link sent to you.");
      return;
    }
    async function load() {
      const res = await fetch(`/api/contractors/by-token/${token}`);
      if (!res.ok) {
        setError("Invalid or expired link. Please request a new one.");
        return;
      }
      const data = await res.json();
      setInfo(data);
    }
    load();
  }, [token]);

  async function handleUpload(section: string, files: FileList | null) {
    if (!files?.length || !token || !info) return;
    setUploading((prev) => ({ ...prev, [section]: true }));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("token", token);
      formData.append("file", file);
      formData.append("section", section);

      const res = await fetch("/api/contractors/upload-by-token", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const doc = await res.json();
        setInfo((prev) =>
          prev ? { ...prev, documents: [...prev.documents, doc] } : null
        );
      }
    }

    setUploading((prev) => ({ ...prev, [section]: false }));
  }

  if (!token) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="max-w-md text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Contractor Upload</h1>
          <p className="text-slate-300">No upload token provided. Please use the link sent to you.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="max-w-md text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Contractor Upload</h1>
          <p className="text-amber-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  const docsBySection: Record<string, Document[]> = {};
  info.documents.forEach((d) => {
    if (!docsBySection[d.section]) docsBySection[d.section] = [];
    docsBySection[d.section].push(d);
  });

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Safety File Upload</h1>
          <p className="text-slate-300 mt-2">{info.name}</p>
          {info.jobDescription && (
            <p className="text-slate-400 text-sm mt-1">{info.jobDescription}</p>
          )}
        </div>

        <p className="text-slate-300 text-center">
          Upload your documents in each section below. You can upload multiple files per section.
        </p>

        <div className="space-y-6">
          {CONTRACTOR_SECTIONS.map(({ id: sectionId, label }) => {
            const docs = docsBySection[sectionId] ?? [];
            const isUploading = uploading[sectionId];

            return (
              <div
                key={sectionId}
                className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6"
              >
                <h3 className="font-semibold text-white mb-4">{label}</h3>

                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-medium transition">
                    {isUploading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
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

                {docs.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {docs.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                      >
                        <FileText size={18} className="text-slate-400" />
                        <span className="flex-1 truncate text-slate-200">
                          {d.fileName}
                        </span>
                        {d.uploadedByContractor && (
                          <span title="Uploaded by you">
                            <CheckCircle size={16} className="text-green-400" />
                          </span>
                        )}
                        <a
                          href={d.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:text-amber-300 text-sm"
                        >
                          Open
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-slate-500 text-sm">
                    No documents uploaded yet.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-slate-500 text-center text-sm">
          Once you have uploaded all required documents, you can close this page.
        </p>
      </div>
    </div>
  );
}

export default function ContractorUploadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-10 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <Loader2 className="animate-spin text-white" size={48} />
        </div>
      }
    >
      <ContractorUploadContent />
    </Suspense>
  );
}
