import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function RequestSignatureListPage() {
  // Only show appointments that still need signatures
  const appointments = await prisma.appointment.findMany({
    where: {
      status: {
        in: ["draft", "pending", "appointer_signed", "appointee_signed"],
      },
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-bold">Request Signatures</h1>

      <p className="opacity-80 max-w-2xl">
        These appointments still require one or more signatures.
      </p>

      <div
        className="rounded-2xl p-6 backdrop-blur-xl shadow-xl"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <table className="w-full text-left">
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--card-border)",
              }}
            >
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
                  No appointments require signatures
                </td>
              </tr>
            )}

            {appointments.map((a) => (
              <tr
                key={a.id}
                style={{
                  borderBottom: "1px solid var(--card-border)",
                }}
              >
                <td className="py-3">{a.type}</td>
                <td className="py-3">{a.appointee}</td>
                <td className="py-3">{a.appointer}</td>
                <td className="py-3">{a.department}</td>
                <td className="py-3">
                  {new Date(a.date).toLocaleDateString()}
                </td>

                <td className="py-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    {a.status.replace("_", " ")}
                  </span>
                </td>

                <td className="py-3">
                  <Link
                    href={`/appointments/sign/${a.id}`}
                    className="button button-neutral text-sm"
                  >
                    Continue
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

