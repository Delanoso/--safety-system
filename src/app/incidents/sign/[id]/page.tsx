"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

type SignContext = {
  incident: {
    id: string;
    title: string;
    type: string;
    date: string;
    severity: string;
  };
  member: {
    id: string;
    name: string;
    designation: string;
    signature: string | null;
    signedAt: string | null;
  };
};

export default function IncidentTeamSignPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const incidentId = params.id as string;
  const teamId = searchParams.get("teamId") ?? "";
  const token = searchParams.get("token") ?? "";

  const [ctx, setCtx] = useState<SignContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    if (!incidentId || !teamId || !token) {
      setError("Invalid or missing signing link.");
      setLoading(false);
      return;
    }
    const q = new URLSearchParams({ teamId, token });
    fetch(`/api/incidents/${incidentId}/team-sign?${q}`)
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d))))
      .then(setCtx)
      .catch((e) => setError(e?.error || "Failed to load signing page."))
      .finally(() => setLoading(false));
  }, [incidentId, teamId, token]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0];
      return {
        x: ((t.clientX - rect.left) * canvas.width) / rect.width,
        y: ((t.clientY - rect.top) * canvas.height) / rect.height,
      };
    }
    const me = e as React.MouseEvent;
    return { x: me.nativeEvent.offsetX, y: me.nativeEvent.offsetY };
  };

  async function saveSignature() {
    const dataUrl = canvasRef.current?.toDataURL("image/png");
    if (!dataUrl) {
      alert("Please draw your signature first.");
      return;
    }
    const res = await fetch(`/api/incidents/${incidentId}/team-sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, token, signature: dataUrl }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "Failed to save signature.");
      return;
    }
    setSaved(true);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center p-6">Loading…</div>;
  }
  if (error || !ctx) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-red-600">
        {error || "Signing link not available."}
      </div>
    );
  }
  if (ctx.member.signature || saved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-xl font-semibold">Thank you</h1>
          <p className="text-gray-600">Your signature has been recorded on the incident investigation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-emerald-900 p-6 text-white">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <p className="text-sm text-gray-300">Incident investigation signature</p>
          <h1 className="text-2xl font-bold mt-1">{ctx.incident.title}</h1>
          <p className="text-sm text-gray-300 mt-2">
            {ctx.member.name} — {ctx.member.designation}
          </p>
        </div>
        <p className="text-sm text-gray-200">
          Please sign below to confirm your participation in this investigation.
        </p>
        <canvas
          ref={canvasRef}
          width={400}
          height={140}
          className="w-full bg-white rounded-lg touch-none cursor-crosshair"
          onMouseDown={(e) => {
            drawing.current = true;
            const ctx2 = canvasRef.current?.getContext("2d");
            const p = getPos(e);
            ctx2?.beginPath();
            ctx2?.moveTo(p.x, p.y);
          }}
          onMouseMove={(e) => {
            if (!drawing.current) return;
            const ctx2 = canvasRef.current?.getContext("2d");
            const p = getPos(e);
            ctx2!.lineTo(p.x, p.y);
            ctx2!.strokeStyle = "#000";
            ctx2!.lineWidth = 2;
            ctx2!.stroke();
          }}
          onMouseUp={() => { drawing.current = false; }}
          onMouseLeave={() => { drawing.current = false; }}
          onTouchStart={(e) => {
            e.preventDefault();
            drawing.current = true;
            const ctx2 = canvasRef.current?.getContext("2d");
            const p = getPos(e);
            ctx2?.beginPath();
            ctx2?.moveTo(p.x, p.y);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            if (!drawing.current) return;
            const ctx2 = canvasRef.current?.getContext("2d");
            const p = getPos(e);
            ctx2!.lineTo(p.x, p.y);
            ctx2!.strokeStyle = "#000";
            ctx2!.lineWidth = 2;
            ctx2!.stroke();
          }}
          onTouchEnd={() => { drawing.current = false; }}
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={saveSignature}
            className="px-5 py-2 rounded-lg bg-emerald-600 font-semibold hover:bg-emerald-700"
          >
            Submit signature
          </button>
          <button
            type="button"
            onClick={() => {
              const c = canvasRef.current;
              c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
            }}
            className="px-5 py-2 rounded-lg bg-white/20"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
