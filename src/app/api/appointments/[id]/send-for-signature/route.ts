// src/app/api/appointments/[id]/send-for-signature/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { requireUser } from "@/lib/auth";

function generateToken() {
  return crypto.randomUUID();
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const current = await requireUser();
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Invalid appointment ID" },
      { status: 400 }
    );
  }

  const { email, role, instructions } = await req.json();

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
      select: { companyId: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (current.role !== "super" && appointment.companyId !== current.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const appointmentFull = await prisma.appointment.findUnique({
      where: { id },
    });
    if (!appointmentFull) {
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
    const signUrl = `${baseUrl}/appointments/sign/${id}?role=${role}&token=${token}`;

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

    await prisma.appointment.update({
      where: { id },
      data: {
        [tokenField]: token,
        status: statusValue,
      },
    });

    const instructionBlock =
      instructions && String(instructions).trim()
        ? `<p style="margin:1em 0;padding:0.75em;background:#f5f5f5;border-left:4px solid #2563eb;"><strong>Instructions from sender:</strong><br/>${String(instructions)
            .trim()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br/>")}</p>`
        : "";

    await resendClient.emails.send({
      from,
      to: email,
      subject:
        role === "appointer"
          ? "Appointment Letter – Appointer Signature Required"
          : "Appointment Letter – Appointee Signature Required",
      html: `
        <p>Dear ${
          role === "appointer" ? appointmentFull.appointer : appointmentFull.appointee
        },</p>
        <p>You have an appointment letter to sign.</p>
        ${instructionBlock}
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

