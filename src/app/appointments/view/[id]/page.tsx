import { prisma } from "@/lib/prisma";
import templates from "@/app/appointments/templates";
import { redirect } from "next/navigation";

/* -----------------------------
   SERVER ACTION: DELETE RECORD
------------------------------ */
async function deleteAppointment(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;

  await prisma.appointment.delete({
    where: { id },
  });

  // ⭐ FIXED ROUTE
  redirect("/appointments");
}

export default async function ViewSingleAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    return (
      <div className="p-10 text-red-600 text-xl font-semibold">
        Appointment not found.
      </div>
    );
  }

  const TemplateComponent = templates[appointment.type];

  return (
    <div className="space-y-10 p-10">

      {/* HEADER + ACTION BUTTONS */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">
          Completed Appointment
        </h1>

        <div className="flex gap-4">

          {/* SAVE AS PDF */}
          <a
            href={`/api/appointments/${appointment.id}/pdf`}
            target="_blank"
            className="
              px-5 py-3 rounded-xl
              bg-blue-600 text-white font-semibold
              hover:bg-blue-700 transition
              shadow-md
            "
          >
            Save as PDF
          </a>

          {/* DELETE BUTTON (SERVER ACTION) */}
          <form action={deleteAppointment}>
            <input type="hidden" name="id" value={appointment.id} />

            <button
              type="submit"
              className="
                px-5 py-3 rounded-xl
                bg-red-600 text-white font-semibold
                hover:bg-red-700 transition
                shadow-md
              "
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* MAIN CARD */}
      <div
        className="
          rounded-2xl p-8
          bg-[rgba(255,255,255,0.55)]
          dark:bg-[rgba(30,60,120,0.45)]
          backdrop-blur-xl
          border border-[rgba(0,0,0,0.15)]
          dark:border-[rgba(255,255,255,0.15)]
          shadow-xl
          space-y-12
        "
      >

        {/* DOCUMENT TEMPLATE */}
        {TemplateComponent ? (
          <TemplateComponent
            appointee={appointment.appointee}
            appointer={appointment.appointer}
            department={appointment.department}
            date={new Date(appointment.date).toLocaleDateString()}
          />
        ) : (
          <p className="text-red-600">
            No template found for: <strong>{appointment.type}</strong>
          </p>
        )}

        <hr className="border-[rgba(0,0,0,0.2)] dark:border-[rgba(255,255,255,0.2)]" />

        {/* SIGNATURE TIMELINE */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[var(--foreground)]">
            Signature Timeline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Detail
              label="Appointee Signed At"
              value={
                appointment.appointeeSignedAt
                  ? new Date(appointment.appointeeSignedAt).toLocaleString()
                  : "Not signed"
              }
            />

            <Detail
              label="Appointer Signed At"
              value={
                appointment.appointerSignedAt
                  ? new Date(appointment.appointerSignedAt).toLocaleString()
                  : "Not signed"
              }
            />
          </div>
        </div>

        {/* SIGNATURE IMAGES */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[var(--foreground)]">
            Final Signatures
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SignatureCard
              title="Appointee Signature"
              src={appointment.appointeeSignature}
            />

            <SignatureCard
              title="Appointer Signature"
              src={appointment.appointerSignature}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   SMALL COMPONENTS
------------------------------ */

function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div
      className="
        p-4 rounded-xl
        bg-[rgba(255,255,255,0.35)]
        dark:bg-[rgba(20,40,80,0.35)]
        backdrop-blur-xl
        border border-[rgba(0,0,0,0.1)]
        dark:border-[rgba(255,255,255,0.1)]
        shadow
      "
    >
      <p className="font-semibold text-[var(--foreground)]">{label}</p>
      <p className="opacity-80 text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function SignatureCard({ title, src }: { title: string; src: string | null }) {
  return (
    <div
      className="
        p-6 rounded-xl
        bg-[rgba(255,255,255,0.45)]
        dark:bg-[rgba(20,40,80,0.45)]
        backdrop-blur-xl
        border border-[rgba(0,0,0,0.15)]
        dark:border-[rgba(255,255,255,0.15)]
        shadow-lg
        space-y-4
      "
    >
      <p className="font-semibold text-[var(--foreground)]">{title}</p>

      {src ? (
        <img
          src={src}
          alt={title}
          className="w-64 border rounded shadow-md bg-white"
        />
      ) : (
        <p className="opacity-70 text-[var(--foreground)]">No signature</p>
      )}
    </div>
  );
}

