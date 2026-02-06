"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateAppointmentForm() {
  const params = useSearchParams();
  const router = useRouter();

  const type = params.get("name") || "Unknown Appointment";

  // Form state
  const [appointee, setAppointee] = useState("");
  const [appointer, setAppointer] = useState("");
  const [date, setDate] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          appointee,
          appointer,
          department,
          date,
          status: "draft", // ⭐ IMPORTANT — goes to Request Appointments
        }),
      });

      if (!res.ok) {
        console.error("Failed to create appointment");
        setLoading(false);
        return;
      }

      // Redirect to Request Appointments list
      router.push("/appointments/request");
      router.refresh();
    } catch (error) {
      console.error("Error creating appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-[var(--foreground)]">
        Create: {type}
      </h1>

      <p className="text-[var(--foreground)] opacity-80 max-w-2xl">
        Please complete the details below for the <strong>{type}</strong> appointment.
      </p>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">

        {/* Appointee */}
        <div>
          <label className="block mb-1 text-[var(--foreground)] font-medium">
            Appointee
          </label>
          <input
            type="text"
            value={appointee}
            onChange={(e) => setAppointee(e.target.value)}
            placeholder="Enter the name of the person being appointed"
            required
            className="
              w-full p-3 rounded-xl
              bg-[rgba(255,255,255,0.55)]
              dark:bg-[rgba(30,60,120,0.45)]
              backdrop-blur-md
              border border-[rgba(0,0,0,0.15)]
              dark:border-[rgba(255,255,255,0.15)]
              text-[var(--foreground)]
            "
          />
        </div>

        {/* Appointer */}
        <div>
          <label className="block mb-1 text-[var(--foreground)] font-medium">
            Appointer
          </label>
          <input
            type="text"
            value={appointer}
            onChange={(e) => setAppointer(e.target.value)}
            placeholder="Enter the name of the person making the appointment"
            required
            className="
              w-full p-3 rounded-xl
              bg-[rgba(255,255,255,0.55)]
              dark:bg-[rgba(30,60,120,0.45)]
              backdrop-blur-md
              border border-[rgba(0,0,0,0.15)]
              dark:border-[rgba(255,255,255,0.15)]
              text-[var(--foreground)]
            "
          />
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 text-[var(--foreground)] font-medium">
            Date of Appointment
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="
              w-full p-3 rounded-xl
              bg-[rgba(255,255,255,0.55)]
              dark:bg-[rgba(30,60,120,0.45)]
              backdrop-blur-md
              border border-[rgba(0,0,0,0.15)]
              dark:border-[rgba(255,255,255,0.15)]
              text-[var(--foreground)]
            "
          />
        </div>

        {/* Department */}
        <div>
          <label className="block mb-1 text-[var(--foreground)] font-medium">
            Department
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Enter the department of the appointee"
            required
            className="
              w-full p-3 rounded-xl
              bg-[rgba(255,255,255,0.55)]
              dark:bg-[rgba(30,60,120,0.45)]
              backdrop-blur-md
              border border-[rgba(0,0,0,0.15)]
              dark:border-[rgba(255,255,255,0.15)]
              text-[var(--foreground)]
            "
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="
            px-6 py-3 rounded-xl font-semibold
            bg-[var(--gold)] text-black
            hover:brightness-110 transition
            disabled:opacity-50
          "
        >
          {loading ? "Saving..." : "Save Appointment"}
        </button>
      </form>
    </div>
  );
}

