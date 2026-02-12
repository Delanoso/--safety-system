import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ViewAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    where: {
      status: "signed",
      appointerSignature: { not: null },
      appointeeSignature: { not: null },
      appointerSignedAt: { not: null },
      appointeeSignedAt: { not: null },
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-[var(--foreground)]">
        Completed Appointments
      </h1>

      <p className="text-[var(--foreground)] opacity-80 max-w-2xl">
        These documents are fully signed and completed. You can open any
        appointment to view its final generated document.
      </p>

      {/* TABLE WRAPPER */}
      <div
        className="
          rounded-2xl p-6
          bg-[rgba(255,255,255,0.55)]
          dark:bg-[rgba(30,60,120,0.45)]
          backdrop-blur-xl
          border border-[rgba(0,0,0,0.15)]
          dark:border-[rgba(255,255,255,0.15)]
          shadow-xl
        "
      >
        <table className="w-full text-left text-[var(--foreground)]">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)]">
              <th className="py-3">Appointment Type</th>
              <th className="py-3">Appointee</th>
              <th className="py-3">Appointer</th>
              <th className="py-3">Department</th>
              <th className="py-3">Date</th>
              <th className="py-3">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {appointments.length === 0 && (
              <tr>
                <td className="py-3 opacity-60" colSpan={7}>
                  No completed appointments found
                </td>
              </tr>
            )}

            {appointments.map((a) => (
              <tr
                key={a.id}
                className="border-b border-[rgba(0,0,0,0.1)] dark:border-[rgba(255,255,255,0.1)]"
              >
                <td className="py-3">{a.type}</td>
                <td className="py-3">{a.appointee}</td>
                <td className="py-3">{a.appointer}</td>
                <td className="py-3">{a.department}</td>
                <td className="py-3">
                  {new Date(a.date).toLocaleDateString()}
                </td>

                {/* STATUS BADGE */}
                <td className="py-3">
                  <span className="px-3 py-1 rounded-full bg-green-600 text-white text-xs font-semibold">
                    Completed
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="py-3">
                  <Link
                    href={`/appointments/view/${a.id}`}
                    className="
                      px-3 py-1 rounded-md text-sm
                      bg-[rgba(255,255,255,0.85)]
                      dark:bg-[rgba(15,30,60,0.85)]
                      border border-[rgba(0,0,0,0.15)]
                      dark:border-[rgba(255,255,255,0.15)]
                      hover:scale-[1.03] transition
                    "
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

