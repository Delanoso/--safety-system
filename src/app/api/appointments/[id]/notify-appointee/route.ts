import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { appointeeToken } = await req.json();

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!appointment.appointeeEmail) {
    return NextResponse.json(
      { error: "Appointee email missing" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const signUrl = `${baseUrl}/appointments/sign/${appointment.id}?role=appointee&token=${appointeeToken}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email (Resend) is not configured" },
      { status: 503 }
    );
  }
  const resendClient = new Resend(apiKey);
  await resendClient.emails.send({
    from: "no-reply@yourdomain.com",
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

