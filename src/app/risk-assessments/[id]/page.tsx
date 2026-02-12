"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, FileDown, Trash2, ChevronDown, ChevronUp } from "lucide-react";

type Assessment = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  assessor: string | null;
  riskLevel: string;
  reviewDate: string | null;
  controls: string | null;
  fileUrl: string | null;
  signature: string | null;
  signedAt: string | null;
  status: string;
};

const RISK_COLORS: Record<string, string> = {
  low: "text-green-700 bg-green-100",
  medium: "text-amber-700 bg-amber-100",
  high: "text-orange-700 bg-orange-100",
  critical: "text-red-700 bg-red-100",
};

export default function RiskAssessmentViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [controlsExpanded, setControlsExpanded] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/risk-assessments/${id}`);
      if (!res.ok) {
        setAssessment(null);
        return;
      }
      const data = await res.json();
      setAssessment(data);
    }
    load();
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this risk assessment?")) return;
    const res = await fetch(`/api/risk-assessments/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/risk-assessments");
  }

  if (!assessment) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
        <div className="max-w-3xl mx-auto">
          <p className="text-black/70">Risk assessment not found.</p>
          <Link href="/risk-assessments" className="text-blue-600 hover:underline mt-4 block">
            ← Back to Risk Assessments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <Link href="/risk-assessments" className="text-black/70 hover:text-black">
            ← Risk Assessments
          </Link>
          <div className="flex gap-2 flex-wrap">
            {assessment.status === "draft" && (
              <Link href={`/risk-assessments/${id}/edit`} className="button button-neutral flex items-center gap-2">
                Edit
              </Link>
            )}
            <a
              href={`/api/pdf?type=risk-assessment&id=${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-pdf flex items-center gap-2"
            >
              <FileDown size={18} />
              Save as PDF
            </a>
            <button
              onClick={handleDelete}
              className="button button-delete flex items-center gap-2"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-8 space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-4">
            <h1 className="text-2xl font-bold text-black">{assessment.title}</h1>
            <span
              className={`px-3 py-1 rounded font-medium shrink-0 ${
                RISK_COLORS[assessment.riskLevel?.toLowerCase()] ??
                "bg-gray-100 text-gray-700"
              }`}
            >
              {assessment.riskLevel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-black/80">
            {assessment.department && (
              <div>
                <span className="font-semibold">Department:</span> {assessment.department}
              </div>
            )}
            {assessment.location && (
              <div>
                <span className="font-semibold">Location:</span> {assessment.location}
              </div>
            )}
            {assessment.assessor && (
              <div>
                <span className="font-semibold">Assessor:</span> {assessment.assessor}
              </div>
            )}
            {assessment.reviewDate && (
              <div>
                <span className="font-semibold">Review Date:</span>{" "}
                {new Date(assessment.reviewDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {assessment.controls && (
            <div>
              <button
                type="button"
                onClick={() => setControlsExpanded((e) => !e)}
                className="flex items-center gap-2 text-lg font-semibold text-black mb-2 w-full text-left"
              >
                Controls / Mitigations
                {controlsExpanded ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {controlsExpanded && (
                <p className="text-black/80 whitespace-pre-wrap">{assessment.controls}</p>
              )}
            </div>
          )}

          {assessment.signature && (
            <div className="pt-4 border-t border-black/10">
              <h2 className="text-lg font-semibold text-black mb-2">Signature</h2>
              <img
                src={assessment.signature}
                alt="Signature"
                className="max-w-[200px] max-h-[80px] border border-black/20 rounded"
              />
              {assessment.signedAt && (
                <p className="text-sm text-black/60 mt-1">
                  Signed on {new Date(assessment.signedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {assessment.fileUrl && (
            <div>
              <a
                href={assessment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline"
              >
                <ExternalLink size={18} />
                View attached document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
