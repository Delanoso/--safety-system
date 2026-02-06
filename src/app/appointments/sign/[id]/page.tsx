"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import templates from "@/app/appointments/templates";

export default function SignAppointmentPage() {
  const router = useRouter();
  const { id } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [signer, setSigner] = useState("appointee");
  const [email, setEmail] = useState("");

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Load appointment
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/appointments/${id}`);
      const data = await res.json();
      setAppointment(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="p-10 text-xl">Loading appointment...</div>;
  if (!appointment)
    return <div className="p-10 text-red-600 text-xl">Appointment not found.</div>;

  const TemplateComponent = templates[appointment.type];

  // Drawing logic
  const startDrawing = (e) => {
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Save signature
  const saveSignature = async () => {
    const dataUrl = canvasRef.current.toDataURL();

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

    // ⭐ FIXED ROUTE
    if (res.ok) router.push(`/appointments/view/${id}`);
  };

  const sendEmail = async () => {
    alert(
      `Email would be sent to ${email} requesting ${signer} signature.\n(Backend email service not implemented yet.)`
    );
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
            I, <strong>{appointment.appointee}</strong>, accept this appointment and
            understand my duties under DMR 18.
          </p>
        </div>

        {/* Signature Pad + Email */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT: SIGNATURE PAD */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Signature Pad</h3>

            <canvas
              ref={canvasRef}
              width={350}
              height={120}
              className="border rounded bg-white shadow"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
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

          {/* RIGHT: EMAIL + SIGNER */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Send for Signature</h3>

            <div className="space-y-4">
              <label className="font-semibold">Recipient Email</label>
              <input
                type="email"
                className="w-full p-3 rounded-lg border bg-white shadow"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <button
              onClick={sendEmail}
              className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-md"
            >
              Send Email
            </button>
          </div>
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
            appointee={appointment.appointee}
            appointer={appointment.appointer}
            department={appointment.department}
            date={new Date(appointment.date).toLocaleDateString()}
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
                  src={appointment.appointeeSignature}
                  className="max-h-full"
                />
              ) : (
                <span className="opacity-50">Awaiting signature</span>
              )}
            </div>

            <p className="opacity-70">
              {appointment.appointeeSignedAt
                ? new Date(appointment.appointeeSignedAt).toLocaleString()
                : ""}
            </p>
          </div>

          {/* Appointer */}
          <div className="space-y-4">
            <p className="font-semibold">Appointer Signature</p>

            <div className="w-64 h-32 bg-white border rounded shadow flex items-center justify-center">
              {appointment.appointerSignature ? (
                <img
                  src={appointment.appointerSignature}
                  className="max-h-full"
                />
              ) : (
                <span className="opacity-50">Awaiting signature</span>
              )}
            </div>

            <p className="opacity-70">
              {appointment.appointerSignedAt
                ? new Date(appointment.appointerSignedAt).toLocaleString()
                : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

