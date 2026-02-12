import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function generateToken() {
  return crypto.randomUUID();
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const email = data.email != null ? String(data.email).trim() : null;
  const phone = data.phone != null ? String(data.phone).trim() : null;
  if (!email && !phone) {
    return NextResponse.json(
      { error: "Email or phone is required to send the signing link." },
      { status: 400 }
    );
  }

  const issue = await prisma.pPEIssue.findUnique({
    where: { id: Number(id) },
    include: { person: true, itemType: true },
  });
  if (!issue) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (issue.status === "signed") {
    return NextResponse.json({ error: "This issue is already signed." }, { status: 400 });
  }

  const token = generateToken();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const signUrl = `${baseUrl}/ppe-management/sign/${id}?token=${token}`;

  await prisma.pPEIssue.update({
    where: { id: Number(id) },
    data: { signToken: token },
  });

  if (email && process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM || "onboarding@resend.dev",
        to: email,
        subject: `PPE Issue – Please sign (${issue.itemType.name} for ${issue.person.name})`,
        html: `
          <p>Hello ${issue.person.name},</p>
          <p>You have been issued <strong>${issue.quantity} x ${issue.itemType.name}</strong>. Please confirm by signing the link below.</p>
          <p><a href="${signUrl}">Sign here</a></p>
          <p>This link is single-use. If you did not expect this, please ignore.</p>
        `,
      });
    } catch (e) {
      console.error("PPE send email error:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    signUrl,
    message: email
      ? "Signing link sent to email (if Resend is configured)."
      : "Use the link below to share (e.g. via SMS or WhatsApp).",
  });
}
