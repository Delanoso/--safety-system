import { prisma } from "@/lib/prisma";
import templates from "@/app/appointments/templates";
import { ViewSignatureBlock } from "@/components/ViewSignatureBlock";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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

          {/* Download PDF – same content as this view */}
          <a
            href={`/pdf-renderer?type=appointment&id=${encodeURIComponent(appointment.id)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Download PDF
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

        {/* SIGNATURES */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-[var(--foreground)]">
            Signatures
          </h2>

          <div className="flex flex-wrap gap-8">
            <ViewSignatureBlock
              label="Appointer"
              signature={appointment.appointerSignature}
              signedAt={appointment.appointerSignedAt != null ? (typeof appointment.appointerSignedAt === "string" ? appointment.appointerSignedAt : appointment.appointerSignedAt.toISOString()) : null}
            />
            <ViewSignatureBlock
              label="Appointee"
              signature={appointment.appointeeSignature}
              signedAt={appointment.appointeeSignedAt != null ? (typeof appointment.appointeeSignedAt === "string" ? appointment.appointeeSignedAt : appointment.appointeeSignedAt.toISOString()) : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


