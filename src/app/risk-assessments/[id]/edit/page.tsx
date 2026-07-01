"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import RiskAssessmentForm from "@/components/RiskAssessmentForm";
import type { RiskAssessmentFormValues } from "@/components/RiskAssessmentForm";
import {
  parseRiskAssessmentControls,
  serializeRiskAssessmentControls,
} from "@/lib/risk-assessment";

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
  status: string;
};

export default function EditRiskAssessmentPage() {
  const params = useParams() as { id: string };
  const id = params.id;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [signAndSave, setSignAndSave] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0] || (e as React.TouchEvent).changedTouches?.[0];
      if (!t) return { x: 0, y: 0 };
      return {
        x: (t.clientX - rect.left) * (canvas.width / rect.width),
        y: (t.clientY - rect.top) * (canvas.height / rect.height),
      };
    }
    const me = e as React.MouseEvent<HTMLCanvasElement>;
    return { x: me.nativeEvent.offsetX, y: me.nativeEvent.offsetY };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    const pos = getPos(e);
    if (ctx) {
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    const pos = getPos(e);
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDraw = () => setIsDrawing(false);

  function canvasHasSignature(): boolean {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) return true;
    }
    return false;
  }

  useEffect(() => {
    fetch(`/api/risk-assessments/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAssessment(data);
      })
      .catch(() => setAssessment(null));
  }, [id]);

  async function handleSubmit(values: RiskAssessmentFormValues) {
    if (signAndSave && !canvasHasSignature()) {
      throw new Error("Please draw your signature before signing and finalising.");
    }

    const payload: Record<string, unknown> = {
      title: values.title,
      department: values.department || null,
      location: values.location || null,
      assessor: values.assessor || null,
      riskLevel: values.riskLevel,
      reviewDate: values.reviewDate || null,
      controls: serializeRiskAssessmentControls(values.template),
      fileUrl: values.fileUrl || null,
    };

    if (signAndSave) {
      payload.signature = canvasRef.current?.toDataURL();
    }

    const res = await fetch(`/api/risk-assessments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to save");

    window.location.href = `/risk-assessments/${id}`;
  }

  const signatureSection = (
    <div className="p-4 rounded-lg bg-white/90 border border-black/10 space-y-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={signAndSave}
          onChange={(e) => setSignAndSave(e.target.checked)}
        />
        <span className="font-semibold text-black">Sign and finalise</span>
      </label>
      {signAndSave && (
        <div className="space-y-2">
          <p className="text-sm text-black/70">Draw your signature below, then click Sign &amp; save.</p>
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            className="border border-black/20 rounded bg-white cursor-crosshair max-w-full"
            style={{ touchAction: "none" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          <button
            type="button"
            onClick={() => {
              const ctx = canvasRef.current?.getContext("2d");
              if (ctx) ctx.clearRect(0, 0, 400, 120);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear signature
          </button>
        </div>
      )}
    </div>
  );

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

  if (assessment.status === "signed") {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
        <div className="max-w-3xl mx-auto">
          <p className="text-black/70">This assessment has been signed. View-only.</p>
          <Link href={`/risk-assessments/${id}`} className="text-blue-600 hover:underline mt-4 block">
            View Assessment
          </Link>
        </div>
      </div>
    );
  }

  const parsed = parseRiskAssessmentControls(assessment.controls);
  const isLegacy = parsed.type === "legacy";

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-blue-200 to-purple-300 min-w-0">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/risk-assessments" className="text-black/70 hover:text-black text-sm">
          ← Risk Assessments
        </Link>

        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-black">Edit Risk Assessment</h1>
          <p className="text-black/70 mt-2 text-sm sm:text-base">
            Review your assessment, sign if ready, then save.
          </p>
        </div>

        {isLegacy ? (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
            This assessment uses an older text format. Create a new assessment for the simplified
            template, or view the current record as-is.
            <Link href={`/risk-assessments/${id}`} className="block mt-2 text-blue-700 underline">
              View assessment
            </Link>
          </div>
        ) : (
          <div className="p-4 sm:p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
            <RiskAssessmentForm
              initialStep={3}
              initial={{
                title: assessment.title,
                department: assessment.department ?? "",
                location: assessment.location ?? "",
                assessor: assessment.assessor ?? "",
                riskLevel: assessment.riskLevel,
                reviewDate: assessment.reviewDate
                  ? new Date(assessment.reviewDate).toISOString().split("T")[0]
                  : "",
                fileUrl: assessment.fileUrl ?? "",
                controls: assessment.controls,
              }}
              submitLabel={signAndSave ? "Sign & save" : "Save changes"}
              step3Footer={signatureSection}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}
