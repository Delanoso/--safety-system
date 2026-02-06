import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

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

  const signUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/appointments/sign/${appointment.id}?role=appointee&token=${appointeeToken}`;

  await resend.emails.send({
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

