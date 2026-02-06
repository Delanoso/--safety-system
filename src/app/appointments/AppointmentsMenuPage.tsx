"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

const appointmentTypes = [
  "Incident Investigator",
  "Ladder Inspector",
  "Earth Leakage Inspector",
  "Portable Electrical Equipment Inspector",
  "Work Permit Controller",
  "Stacking Supervisor",
  "Racking Safety Supervisor",
  "Lifting Equipment Inspector",
  "Hygiene Controller",
  "Hazardous Chemical Substances Controller",
  "Health and Safety Coordinator",
  "Health and Safety Supervisor",
  "Motor Transport Officer",
  "Security Coordinator",
  "Health and Safety Program Auditor",
  "Lifting Machine Operator",
  "Vessels Under Pressure Inspector",
  "Gas Welding and Cutting Equipment Inspector",
  "Scaffolding Erector",
  "Scaffolding Inspector",
  "Fall Protection Plan Developer",
  "Lifting Machine Inspector",
  "Fire Equipment Inspector",
  "Fire Marshall",
  "First Aid Marshall",
  "Pollution Controller",
  "Section 16(2)(1) - Assistant to the Chief Executive Officer",
  "Workplace Section 16(2)(2)",
  "Health and Safety Committee Chairman",
  "Health and Safety Committee Member",
  "Health and Safety Representative",
  "Accredited Installation Electrician",
  "First Aider",
  "Fire Team Member",
  "Fire and Emergency Protection Officer",
  "Section 16(1) Chief Executive Officer",
];

export default function AppointmentsMenuPage() {
  const router = useRouter();
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const handleCreateClick = () => setShowTypeSelector(true);

  const handleSelectType = (type: string) => {
    setShowTypeSelector(false);
    router.push(`/appointments/create?type=${encodeURIComponent(type)}`);
  };

  return (
    <div className="min-h-screen w-full p-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* ⭐ TOP LEFT DASHBOARD BUTTON (IDENTICAL TO INCIDENTS PAGE) */}
        <div className="flex justify-start">
          <Link href="/dashboard" className="button button-neutral flex items-center gap-2">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>

        {/* PAGE HEADER */}
        <div
          className="rounded-2xl p-8 backdrop-blur-xl shadow-xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h1 className="text-4xl font-bold">Appointments</h1>
          <p className="opacity-70 mt-2">
            Choose what you want to do with appointments.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid gap-6">

          {/* CREATE APPOINTMENT */}
          <button
            onClick={handleCreateClick}
            className="rounded-2xl p-6 backdrop-blur-xl shadow-xl text-left transition"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <h2 className="text-xl font-semibold mb-2">Create Appointment</h2>
            <p className="opacity-80 text-sm">
              Start a new appointment by selecting the type and capturing the details.
            </p>
          </button>

          {/* REQUEST SIGNATURE */}
          <button
            onClick={() => router.push("/appointments/request-signature")}
            className="rounded-2xl p-6 backdrop-blur-xl shadow-xl text-left transition"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <h2 className="text-xl font-semibold mb-2">Request Signature</h2>
            <p className="opacity-80 text-sm">
              View draft appointments and prepare them for signing.
            </p>
          </button>

          {/* VIEW ALL APPOINTMENTS */}
          <button
            onClick={() => router.push("/appointments/view")}
            className="rounded-2xl p-6 backdrop-blur-xl shadow-xl text-left transition"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <h2 className="text-xl font-semibold mb-2">View All Appointments</h2>
            <p className="opacity-80 text-sm">
              Browse completed, signed appointments as read‑only documents.
            </p>
          </button>
        </div>

        {/* TYPE SELECTOR OVERLAY */}
        {showTypeSelector && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div
              className="
                max-h-[80vh] w-full max-w-3xl overflow-y-auto
                rounded-2xl p-6 backdrop-blur-xl shadow-xl
              "
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Select Appointment Type</h2>
                <button
                  onClick={() => setShowTypeSelector(false)}
                  className="text-sm opacity-70 hover:opacity-100"
                >
                  Close
                </button>
              </div>

              <p className="mb-4 text-sm opacity-80">
                Choose the type of appointment you want to create.
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                {appointmentTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSelectType(type)}
                    className="text-left p-3 rounded-xl transition"
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
