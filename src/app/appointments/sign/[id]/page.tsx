"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import templates from "@/app/appointments/templates";
import { openWhatsAppLink } from "@/lib/open-whatsapp";

export default function SignAppointmentPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const linkRole = searchParams.get("role");
  const linkToken = searchParams.get("token");
  const isExternalLink = !!(linkRole && linkToken && (linkRole === "appointer" || linkRole === "appointee"));

  const [appointment, setAppointment] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [signer, setSigner] = useState("appointee");
  const [phone, setPhone] = useState("");
  const [instructions, setInstructions] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    async function load() {
      setLoadError(null);
      try {
        if (isExternalLink) {
          const q = new URLSearchParams({ role: linkRole!, token: linkToken! });
          const res = await fetch(`/api/appointments/${id}/public?${q}`);
          const data = await res.json();
          if (!res.ok) {
            setLoadError(data.error || "Invalid signing link");
            return;
          }
          setAppointment(data);
          setSigner(linkRole!);
        } else {
          const res = await fetch(`/api/appointments/${id}`);
          const data = await res.json();
          if (!res.ok) {
            setLoadError(data.error || "Unable to load appointment");
            return;
          }
          setAppointment(data);
        }
      } catch {
        setLoadError("Failed to load appointment");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isExternalLink, linkRole, linkToken]);

  if (loading) return <div className="p-10 text-xl">Loading appointment...</div>;
  if (loadError || !appointment) {
    return <div className="p-10 text-red-600 text-xl">{loadError || "Appointment not found."}</div>;
  }
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-10">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-2xl font-bold">Thank you</h1>
          <p className="text-gray-600">Your signature has been saved on the appointment letter.</p>
        </div>
      </div>
    );
  }

  const TemplateComponent = templates[appointment.type as keyof typeof templates];

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t =
        e.touches[0] ||
        (e as unknown as React.TouchEvent<HTMLCanvasElement>).changedTouches[0];
      return {
        x: ((t.clientX - rect.left) * canvas.width) / rect.width,
        y: ((t.clientY - rect.top) * canvas.height) / rect.height,
      };
    }
    const me = e as React.MouseEvent<HTMLCanvasElement>;
    return { x: me.nativeEvent.offsetX, y: me.nativeEvent.offsetY };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();

    if (isExternalLink) {
      const res = await fetch(`/api/appointments/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: linkRole,
          token: linkToken,
          signature: dataUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to save signature");
        return;
      }
      setSubmitted(true);
      return;
    }

    const field =
      signer === "appointee" ? "appointeeSignature" : "appointerSignature";

    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [field]: dataUrl,
        status:
          field === "appointeeSignature"
            ? "appointee_signed"
            : "appointer_signed",
      }),
    });

    if (res.ok) router.push(`/appointments/view/${id}`);
  };

  const sendWhatsApp = async () => {
    if (!phone?.trim()) {
      alert("Please enter a WhatsApp phone number.");
      return;
    }
    try {
      const res = await fetch(`/api/appointments/${id}/send-for-signature`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          role: signer,
          instructions: instructions.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to send via WhatsApp");
        return;
      }
      if (data.whatsappUrl) {
        openWhatsAppLink(data.whatsappUrl);
      }
      alert("WhatsApp opened with the signature request. Send the message to complete.");
    } catch (err) {
      alert("Failed to send via WhatsApp. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-10 p-10">

      <h1 className="text-4xl font-bold text-[var(--foreground)]">
        Sign Appointment
      </h1>

      {/* -------------------------------------------------- */}
      {/* TOP BLOCK — ACCEPTANCE + SIGNATURE PAD + EMAIL     */}
      {/* -------------------------------------------------- */}
      <div
        className="
          rounded-2xl p-8
          bg-[rgba(255,255,255,0.55)]
          dark:bg-[rgba(30,60,120,0.45)]
          backdrop-blur-xl
          border border-[rgba(0,0,0,0.15)]
          dark:border-[rgba(255,255,255,0.15)]
          shadow-xl
          space-y-10
        "
      >
        {/* Acceptance */}
        <div>
          <h2 className="text-2xl font-semibold text-[var(--foreground)]">
            Acceptance of Appointment
          </h2>

          <p className="opacity-80 text-[var(--foreground)] mt-2">
            I, <strong>{String(appointment.appointee)}</strong>, accept this appointment and
            understand my duties under DMR 18.
          </p>
        </div>

        {/* Signature Pad (+ staff send WhatsApp) */}
        <div className={`grid grid-cols-1 ${isExternalLink ? "" : "lg:grid-cols-2"} gap-10`}>

          {/* LEFT: SIGNATURE PAD */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Signature Pad</h3>

            <canvas
              ref={canvasRef}
              width={350}
              height={120}
              className="border rounded bg-white shadow block my-4 w-full max-w-[350px] touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            <div className="flex gap-4">
              <button
                onClick={saveSignature}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md"
              >
                Save Signature
              </button>

              <button
                onClick={clearSignature}
                className="px-6 py-3 rounded-xl bg-gray-300 text-black font-semibold hover:bg-gray-400 transition shadow-md"
              >
                Clear Signature
              </button>
            </div>
          </div>

          {/* RIGHT: staff only — forward via WhatsApp */}
          {!isExternalLink && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Send for Signature</h3>

            <div className="space-y-4">
              <label className="font-semibold">Recipient WhatsApp number</label>
              <input
                type="tel"
                className="w-full p-3 rounded-lg border bg-white shadow"
                placeholder="e.g. 0821234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <label className="font-semibold">Who Must Sign?</label>
              <select
                value={signer}
                onChange={(e) => setSigner(e.target.value)}
                className="w-full p-3 rounded-lg border bg-white shadow"
              >
                <option value="appointee">Appointee</option>
                <option value="appointer">Appointer</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="font-semibold">Instructions (optional)</label>
              <textarea
                className="w-full p-3 rounded-lg border bg-white shadow min-h-[80px]"
                placeholder="e.g. Please sign before Friday, or add any special instructions for the recipient..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
              />
            </div>

            <button
              onClick={sendWhatsApp}
              className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-md"
            >
              Send via WhatsApp
            </button>
          </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* MIDDLE BLOCK — APPOINTMENT DOCUMENT                */}
      {/* -------------------------------------------------- */}
      <div
        className="
          rounded-2xl p-8
          bg-[rgba(255,255,255,0.55)]
          dark:bg-[rgba(30,60,120,0.45)]
          backdrop-blur-xl
          border border-[rgba(0,0,0,0.15)]
          dark:border-[rgba(255,255,255,0.15)]
          shadow-xl
          space-y-10
        "
      >
        {TemplateComponent && (
          <TemplateComponent
            appointee={String(appointment.appointee)}
            appointer={String(appointment.appointer)}
            department={String(appointment.department)}
            date={new Date(String(appointment.date)).toLocaleDateString()}
          />
        )}
      </div>

      {/* -------------------------------------------------- */}
      {/* BOTTOM BLOCK — SIGNATURE BOXES                     */}
      {/* -------------------------------------------------- */}
      <div
        className="
          rounded-2xl p-8
          bg-[rgba(255,255,255,0.55)]
          dark:bg-[rgba(30,60,120,0.45)]
          backdrop-blur-xl
          border border-[rgba(0,0,0,0.15)]
          dark:border-[rgba(255,255,255,0.15)]
          shadow-xl
          space-y-10
        "
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Appointee */}
          <div className="space-y-4">
            <p className="font-semibold">Appointee Signature</p>

            <div className="w-64 h-32 bg-white border rounded shadow flex items-center justify-center">
              {appointment.appointeeSignature ? (
                <img
                  src={String(appointment.appointeeSignature)}
                  className="max-h-full"
                  alt="Appointee signature"
                />
              ) : (
                <span className="opacity-50">Awaiting signature</span>
              )}
            </div>

            <p className="opacity-70">
              {appointment.appointeeSignedAt
                ? new Date(String(appointment.appointeeSignedAt)).toLocaleString()
                : ""}
            </p>
          </div>

          {/* Appointer */}
          <div className="space-y-4">
            <p className="font-semibold">Appointer Signature</p>

            <div className="w-64 h-32 bg-white border rounded shadow flex items-center justify-center">
              {appointment.appointerSignature ? (
                <img
                  src={String(appointment.appointerSignature)}
                  className="max-h-full"
                  alt="Appointer signature"
                />
              ) : (
                <span className="opacity-50">Awaiting signature</span>
              )}
            </div>

            <p className="opacity-70">
              {appointment.appointerSignedAt
                ? new Date(String(appointment.appointerSignedAt)).toLocaleString()
                : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

