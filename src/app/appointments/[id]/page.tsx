"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileDown } from "lucide-react";

export default function AppointmentViewer() {
  const { id } = useParams();
  const router = useRouter();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointment();
  }, []);

  async function loadAppointment() {
    try {
      const res = await fetch(`/api/appointments/${id}`);
      const json = await res.json();
      setAppointment(json);
    } catch (err) {
      console.error("Failed to load appointment:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading appointment...
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Appointment not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* BACK BUTTON */}
        <button
          onClick={() => router.push("/appointments")}
          className="button button-neutral flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Appointments
        </button>

        {/* HEADER CARD */}
        <div
          className="rounded-2xl p-8 backdrop-blur-xl shadow-xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h1 className="text-4xl font-bold">{appointment.title}</h1>
          <p className="opacity-70 mt-2">
            Appointment ID: {appointment.id}
          </p>
          <p className="opacity-70">
            Date: {new Date(appointment.date).toLocaleDateString()}
          </p>
        </div>

        {/* DETAILS CARD */}
        <div
          className="rounded-2xl p-8 backdrop-blur-xl shadow-xl space-y-6"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <Detail label="Client Name" value={appointment.clientName} />
          <Detail label="Email" value={appointment.email} />
          <Detail label="Phone" value={appointment.phone} />
          <Detail label="Type" value={appointment.type} />
          <Detail label="Status" value={appointment.status} />
          <Detail label="Notes" value={appointment.notes || "No notes"} />
        </div>

        {/* PDF BUTTON */}
        <button
          className="button button-pdf flex items-center gap-2 w-full justify-center"
          onClick={() => {
            if (!appointment) return;
            const url = `/api/pdf?type=appointment&id=${encodeURIComponent(
              appointment.id
            )}`;
            window.open(url, "_blank");
          }}
        >
          <FileDown size={18} />
          Download Appointment PDF
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   REUSABLE COMPONENT
------------------------------------------------------- */

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide opacity-70">
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

