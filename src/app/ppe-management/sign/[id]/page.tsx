"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";

type Issue = {
  id: number;
  personId: number;
  itemTypeId: number;
  quantity: number;
  issueDate: string;
  status: string;
  person: { name: string; email: string | null; phone: string | null };
  itemType: { name: string };
};

export default function PPESignPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const token = searchParams.get("token");

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!id || !token) {
      setError("Invalid or missing signing link.");
      setLoading(false);
      return;
    }
    fetch(`/api/ppe/issues/${id}?token=${encodeURIComponent(token)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid or expired link.");
        return r.json();
      })
      .then(setIssue)
      .catch((e) => setError(e?.message || "Failed to load."))
      .finally(() => setLoading(false));
  }, [id, token]);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0] || (e as unknown as React.TouchEvent).changedTouches[0];
      return { x: (t.clientX - rect.left) * (canvas.width / rect.width), y: (t.clientY - rect.top) * (canvas.height / rect.height) };
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
  const clearCanvas = () => {
    const c = canvasRef.current;
    if (c) {
      const ctx = c.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, c.width, c.height);
    }
  };

  function submitSignature() {
    const dataUrl = canvasRef.current?.toDataURL();
    if (!dataUrl) {
      alert("Please draw your signature first.");
      return;
    }
    if (!token) return;
    fetch(`/api/ppe/issues/${id}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, signature: dataUrl }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        return r.json();
      })
      .then(() => setSaved(true))
      .catch((err) => alert(err?.error || "Failed to save signature."));
  }

  if (loading) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }
  if (error || !issue) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <p className="text-red-600 font-semibold">{error || "Not found."}</p>
      </div>
    );
  }
  if (issue.status === "signed") {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-8 text-center">
          <h1 className="text-2xl font-bold text-black">Already signed</h1>
          <p className="text-black/70 mt-2">You have already signed for this PPE issue. Thank you.</p>
        </div>
      </div>
    );
  }
  if (saved) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-8 text-center">
          <h1 className="text-2xl font-bold text-green-700">Thank you</h1>
          <p className="text-black/70 mt-2">Your signature has been recorded successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-black">PPE Issue – Sign to confirm</h1>
        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
          <p className="text-black/80 mb-4">
            You are confirming receipt of <strong>{issue.quantity} x {issue.itemType.name}</strong>.
          </p>
          <p className="text-sm text-black/60">Draw your signature below and tap Submit.</p>
          <canvas
            ref={canvasRef}
            width={350}
            height={120}
            className="border rounded bg-white shadow block my-4 w-full max-w-[350px] touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={submitSignature}
              className="px-5 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
            >
              Submit signature
            </button>
            <button onClick={clearCanvas} className="px-5 py-2 rounded-xl bg-gray-300 text-black">
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
