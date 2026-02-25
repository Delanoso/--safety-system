import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { requireUser } from "@/lib/auth";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const current = await requireUser();
  const { id } = await context.params;

  const { appointeeToken } = await req.json();

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    select: { companyId: true, appointee: true, appointer: true, appointeeEmail: true, appointeeToken: true },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (current.role !== "super" && appointment.companyId !== current.companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!appointment.appointeeEmail) {
    return NextResponse.json(
      { error: "Appointee email missing" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const signUrl = `${baseUrl}/appointments/sign/${id}?role=appointee&token=${appointeeToken}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Email is not configured. Add RESEND_API_KEY to .env.local and optionally RESEND_FROM (e.g. onboarding@resend.dev). See .env.example.",
      },
      { status: 503 }
    );
  }
  const from = process.env.RESEND_FROM || "onboarding@resend.dev";
  const resendClient = new Resend(apiKey);
  await resendClient.emails.send({
    from,
    to: appointment.appointeeEmail,
    subject: "Appointment Letter – Please Sign",
    html: `
      <p>Dear ${appointment.appointee},</p>
      <p>Your appointer (${appointment.appointer}) has signed your appointment letter.</p>
      <p><a href="${signUrl}">Click here to review and sign</a></p>
    `,
  });

  return NextResponse.json({ ok: true });
}

