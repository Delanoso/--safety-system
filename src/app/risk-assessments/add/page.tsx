"use client";

import Link from "next/link";
import RiskAssessmentForm from "@/components/RiskAssessmentForm";
import type { RiskAssessmentFormValues } from "@/components/RiskAssessmentForm";
import { serializeRiskAssessmentControls } from "@/lib/risk-assessment";

export default function AddRiskAssessmentPage() {
  async function handleSubmit(values: RiskAssessmentFormValues) {
    const res = await fetch("/api/risk-assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        department: values.department || null,
        location: values.location || null,
        assessor: values.assessor || null,
        riskLevel: values.riskLevel,
        reviewDate: values.reviewDate || null,
        controls: serializeRiskAssessmentControls(values.template),
        fileUrl: values.fileUrl || null,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Failed to save");

    window.location.href = `/risk-assessments/${data.id}/edit`;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-blue-200 to-purple-300 min-w-0">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/risk-assessments" className="text-black/70 hover:text-black text-sm">
          ← Risk Assessments
        </Link>

        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-black">New Risk Assessment</h1>
          <p className="text-black/70 mt-2 text-sm sm:text-base">
            Three simple steps: describe the task, list hazards and controls, then review and save.
          </p>
        </div>

        <div className="p-4 sm:p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
          <RiskAssessmentForm onSubmit={handleSubmit} submitLabel="Save & continue to sign" />
        </div>
      </div>
    </div>
  );
}
