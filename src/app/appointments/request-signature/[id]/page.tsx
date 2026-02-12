"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AppointmentLetterViewer from "../../../../components/AppointmentLetterViewer";
import { AppointmentTemplateKey } from "../../../appointments/templates";

interface Appointment {
  id: string;
  type: AppointmentTemplateKey;
  appointee: string;
  appointer: string;
  department: string;
  date: string;
  status: string;
  notes?: string;
  appointeeSignature?: string;
  appointerSignature?: string;
}

export default function RequestSignaturePage() {
  const params = useParams();
  const router = useRouter();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [savingSignature, setSavingSignature] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [role, setRole] = useState<"appointer" | "appointee">("appointer");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const letterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/appointments/${params.id}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          // FIXED ROUTE
          router.push("/appointments");
          return;
        }

        const data = await res.json();
        setAppointment(data);
      } catch (err) {
        console.error("Error loading appointment:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id, router]);

  // Signature pad logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawing.current = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    drawing.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Save signature based on dropdown
  const saveSignature = async () => {
    if (!canvasRef.current || !appointment) return;

    const signatureData = canvasRef.current.toDataURL("image/png");
    const field =
      role === "appointer" ? "appointerSignature" : "appointeeSignature";

    setSavingSignature(true);

    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: signatureData }),
      });

      if (!res.ok) {
        console.error("Failed to save signature");
        return;
      }

      const updated = await res.json();
      setAppointment(updated);

      alert("Signature saved successfully.");
    } catch (err) {
      console.error("Error saving signature:", err);
    } finally {
      setSavingSignature(false);
    }
  };

  const updateStatus = async (status: "pending" | "signed") => {
    if (!appointment) return;
    setUpdatingStatus(true);

    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        console.error("Failed to update status");
        return;
      }

      const updated = await res.json();
      setAppointment(updated);
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendForSignature = async () => {
    if (!appointment) return;

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Enter a valid email address");
      return;
    }

    setEmailError("");
    setUpdatingStatus(true);

    try {
      const res = await fetch(
        `/api/appointments/${appointment.id}/send-for-signature`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to send signature request. Check that RESEND_API_KEY is set in .env.local.");
        return;
      }

      alert(
        `Signature request sent to the ${
          role === "appointer" ? "appointer" : "appointee"
        }.`
      );
    } catch (err) {
      console.error("Error sending signature request:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkSigned = () => updateStatus("signed");

  const handleExportPdf = () => {
    if (!letterRef.current) {
      window.print();
      return;
    }

    const printContents = letterRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="p-6 text-[var(--foreground)] animate-pulse">
        Loading appointment…
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6 text-[var(--foreground)]">
        Appointment not found.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">

      {/* ⭐ TWO BLOCKS SIDE BY SIDE ⭐ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Signature Pad */}
        <div className="rounded-2xl p-6 shadow-xl bg-teal-600 text-white">
          <h2 className="text-xl font-semibold mb-4">Signature Pad</h2>

          <div className="border border-white/30 rounded-lg bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="w-full h-40 cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={clearSignature}
              className="px-4 py-2 rounded-md bg-white text-teal-700 font-semibold hover:bg-gray-200 transition"
            >
              Clear Signature
            </button>

            <button
              onClick={saveSignature}
              disabled={savingSignature}
              className="px-4 py-2 rounded-md bg-white text-teal-700 font-semibold hover:bg-gray-200 transition disabled:opacity-50"
            >
              {savingSignature ? "Saving…" : "Save Signature"}
            </button>
          </div>
        </div>

        {/* RIGHT — Workflow Actions */}
        <div className="rounded-2xl p-6 shadow-xl bg-teal-600 text-white">
          <h2 className="text-xl font-semibold mb-2">Workflow Actions</h2>

          <p className="text-sm text-white/80 mb-4">
            Use these actions to move the appointment through its lifecycle.
          </p>

          {/* Save signature as */}
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-sm font-medium text-white/90">
              Save signature as
            </label>

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "appointer" | "appointee")
              }
              className="p-2 rounded-md text-teal-900 bg-white border border-white/30"
            >
              <option value="appointer">Appointer</option>
              <option value="appointee">Appointee</option>
            </select>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-sm font-medium text-white/90">
              Email address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className="p-2 rounded-md text-teal-900 bg-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            />

            {emailError && (
              <p className="text-red-200 text-sm">{emailError}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSendForSignature}
              disabled={updatingStatus}
              className="px-4 py-2 rounded-md bg-white text-teal-700 font-semibold hover:bg-gray-200 disabled:opacity-50"
            >
              {updatingStatus ? "Sending..." : "Send for Signature"}
            </button>

            <button
              onClick={handleMarkSigned}
              disabled={updatingStatus}
              className="px-4 py-2 rounded-md bg-white text-teal-700 font-semibold hover:bg-gray-200 disabled:opacity-50"
            >
              Mark as Signed
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-2xl p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-6 text-left">
          Appointment Details
        </h2>

        <div className="flex flex-col gap-6 text-[var(--foreground)]">
          <div className="flex flex-col">
            <span className="text-sm text-[var(--muted-foreground)]">
              Appointee:
            </span>
            <span className="text-lg font-medium">{appointment.appointee}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-[var(--muted-foreground)]">
              Appointer:
            </span>
            <span className="text-lg font-medium">{appointment.appointer}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-[var(--muted-foreground)]">
              Department:
            </span>
            <span className="text-lg font-medium">
              {appointment.department}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-[var(--muted-foreground)]">
              Appointment Type:
            </span>
            <span className="text-lg font-medium">{appointment.type}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-[var(--muted-foreground)]">
              Status:
            </span>
            <span className="text-lg font-medium">{appointment.status}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-[var(--muted-foreground)]">
              Date:
            </span>
            <span className="text-lg font-medium">
              {new Date(appointment.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Letter Preview */}
      <div
        ref={letterRef}
        className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
          Letter Preview
        </h2>

        <AppointmentLetterViewer appointment={appointment} />
      </div>
    </div>
  );
}

