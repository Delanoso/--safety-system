"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];

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
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    assessor: "",
    riskLevel: "",
    reviewDate: "",
    controls: "",
    fileUrl: "",
  });
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    fetch(`/api/risk-assessments/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAssessment(data);
        setForm({
          title: data.title ?? "",
          department: data.department ?? "",
          location: data.location ?? "",
          assessor: data.assessor ?? "",
          riskLevel: data.riskLevel ?? "",
          reviewDate: data.reviewDate
            ? new Date(data.reviewDate).toISOString().split("T")[0]
            : "",
          controls: data.controls ?? "",
          fileUrl: data.fileUrl ?? "",
        });
      })
      .catch(() => setAssessment(null));
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      department: form.department.trim() || null,
      location: form.location.trim() || null,
      assessor: form.assessor.trim() || null,
      riskLevel: form.riskLevel.trim(),
      reviewDate: form.reviewDate || null,
      controls: form.controls.trim() || null,
      fileUrl: form.fileUrl.trim() || null,
    };

    if (signAndSave) {
      const dataUrl = canvasRef.current?.toDataURL();
      if (!dataUrl) {
        alert("Please draw your signature first.");
        setSaving(false);
        return;
      }
      payload.signature = dataUrl;
    }

    try {
      const res = await fetch(`/api/risk-assessments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      window.location.href = signAndSave ? `/risk-assessments/${id}` : `/risk-assessments/${id}`;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-3xl mx-auto space-y-10">
        <Link href="/risk-assessments" className="text-black/70 hover:text-black">
          ← Risk Assessments
        </Link>

        <h1 className="text-4xl font-bold text-black">Edit Risk Assessment</h1>
        <p className="text-black/70">Review, edit and sign. Save will move you to the view page.</p>

        <form onSubmit={handleSave} className="space-y-6 p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Assessor</label>
              <input
                type="text"
                name="assessor"
                value={form.assessor}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-black mb-1">Risk Level</label>
              <select
                name="riskLevel"
                value={form.riskLevel}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-white/40 bg-white/70 text-black"
                required
              >
                <option value="">Select...</option>
                {RISK_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Review Date</label>
            <input
              type="date"
              name="reviewDate"
              value={form.reviewDate}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Controls / Mitigations
            </label>
            <textarea
              name="controls"
              value={form.controls}
              onChange={handleChange}
              rows={8}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Document URL (optional)
            </label>
            <input
              type="url"
              name="fileUrl"
              value={form.fileUrl}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          <div className="p-4 rounded-lg bg-white/40 border border-white/60">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={signAndSave}
                onChange={(e) => setSignAndSave(e.target.checked)}
              />
              <span className="font-semibold">Sign and finalise</span>
            </label>
            {signAndSave && (
              <div>
                <p className="text-sm text-black/70 mb-2">Draw your signature:</p>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={120}
                  className="border border-black/20 rounded bg-white cursor-crosshair"
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
                  className="text-sm text-blue-600 mt-2 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="button button-save flex-1 py-3"
            >
              {saving ? "Saving..." : signAndSave ? "Sign & Save" : "Save"}
            </button>
            <Link href={`/risk-assessments/${id}`} className="button button-neutral py-3 px-6">
              Preview
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
