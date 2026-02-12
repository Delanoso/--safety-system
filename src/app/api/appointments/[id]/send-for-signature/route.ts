// src/app/api/appointments/[id]/send-for-signature/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

function generateToken() {
  return crypto.randomUUID();
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  console.log("📨 SEND-FOR-SIGNATURE PARAM ID:", id);

  if (!id) {
    return NextResponse.json(
      { error: "Invalid appointment ID" },
      { status: 400 }
    );
  }

  const { email, role } = await req.json();

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  if (!["appointer", "appointee"].includes(role)) {
    return NextResponse.json(
      { error: "Invalid role" },
      { status: 400 }
    );
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const token = generateToken();

    // Decide which token + status to update based on role
    let tokenField: "appointerToken" | "appointeeToken";
    let statusValue: string;

    if (role === "appointer") {
      tokenField = "appointerToken";
      statusValue = "pending_appointer";
    } else {
      tokenField = "appointeeToken";
      statusValue = "pending_appointee";
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const signUrl = `${baseUrl}/appointments/sign/${appointment.id}?role=${role}&token=${token}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Email (Resend) is not configured" },
        { status: 503 }
      );
    }
    const resend = new Resend(apiKey);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Email (Resend) is not configured" },
        { status: 503 }
      );
    }
    const resend = new Resend(apiKey);

    await prisma.appointment.update({
      where: { id },
      data: {
        [tokenField]: token,
        status: statusValue,
      },
    });

    await resend.emails.send({
      from: "onboarding@resend.dev", // works without domain verification
      to: email,
      subject:
        role === "appointer"
          ? "Appointment Letter – Appointer Signature Required"
          : "Appointment Letter – Appointee Signature Required",
      html: `
        <p>Dear ${
          role === "appointer" ? appointment.appointer : appointment.appointee
        },</p>
        <p>You have an appointment letter to sign.</p>
        <p><a href="${signUrl}">Click here to review and sign</a></p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ SEND-FOR-SIGNATURE ERROR:", err);
    return NextResponse.json(
      { error: "Failed to send signature request" },
      { status: 500 }
    );
  }
}

