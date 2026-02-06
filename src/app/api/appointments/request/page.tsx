"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RequestAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/appointments?status=draft", {
        cache: "no-store",
      });
      const data = await res.json();
      setAppointments(data);
    }

    load();
  }, []);

  return (
    <div className="space-y-10 p-6">
      <h1 className="text-4xl font-bold text-[var(--foreground)]">
        Request Appointments
      </h1>

      <p className="opacity-80 text-[var(--foreground)] max-w-2xl">
        These appointments are still in draft form and can be edited before
        sending for signature.
      </p>

      <div className="space-y-4">
        {appointments.map((a: any) => (
          <Link
            key={a.id}
            href={`/dashboard/appointments/request-signature/${a.id}`}
            className="
              block p-4 rounded-xl bg-[rgba(255,255,255,0.55)]
              dark:bg-[rgba(30,60,120,0.45)]
              backdrop-blur-md border border-[rgba(0,0,0,0.15)]
              dark:border-[rgba(255,255,255,0.15)]
              hover:scale-[1.02] hover:shadow-lg transition
            "
          >
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{a.name}</p>
                <p className="opacity-70">{a.date} at {a.time}</p>
              </div>
              <p className="opacity-70">{a.department}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

