import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: electionId } = await context.params;
  const current = await requireUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { voterIds } = body; // array of voter ids to send to
  if (!Array.isArray(voterIds) || voterIds.length === 0) {
    return NextResponse.json({ error: "voterIds array is required" }, { status: 400 });
  }

  const election = await prisma.sHEElection.findFirst({
    where: {
      id: electionId,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (!election) return NextResponse.json({ error: "Election not found" }, { status: 404 });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  let emailSent = 0;
  const useResend = !!process.env.RESEND_API_KEY;
  const useSmtp = !!process.env.SMTP_HOST && !!process.env.SMTP_USER;

  const voters = await prisma.sHEElectionVoter.findMany({
    where: { id: { in: voterIds }, electionId },
  });

  for (const voter of voters) {
    if (!voter.email || voter.votedAt) continue;
    const voteUrl = `${baseUrl}/vote/she/${electionId}?token=${voter.voteToken}`;
    const subject = `SHE Rep Election – Cast Your Vote`;
    const html = `
      <p>You have been invited to vote in the <strong>${election.title}</strong> SHE Rep election.</p>
      <p><a href="${voteUrl}">Cast your vote here</a></p>
      <p>This link is unique to you. Please do not share it.</p>
    `;
    try {
      if (useResend) {
        const { Resend } = await import("resend");
        const resendClient = new Resend(process.env.RESEND_API_KEY!);
        await resendClient.emails.send({
          from: process.env.RESEND_FROM || "onboarding@resend.dev",
          to: voter.email,
          subject,
          html,
        });
      } else if (useSmtp) {
        await sendEmail({ to: voter.email, subject, html });
      } else {
        continue;
      }
      emailSent++;
    } catch (e) {
      console.error("Send vote email error:", e);
    }
  }

  // Return links for ALL voters who haven't voted – user can copy and send via email, SMS or WhatsApp
  const linksForManual = voters
    .filter((v) => !v.votedAt)
    .map((v) => ({
      id: v.id,
      email: v.email,
      phone: v.phone,
      voteUrl: `${baseUrl}/vote/she/${electionId}?token=${v.voteToken}`,
    }));

  let message: string;
  if (emailSent > 0) {
    message = `Vote links sent to ${emailSent} email(s). Copy links below for anyone without email.`;
  } else if (!useResend && !useSmtp) {
    message =
      "Email not configured. Add RESEND_API_KEY or SMTP_* vars to .env.local, then restart. Copy the links below to share manually.";
  } else {
    message = "No emails sent (check server console for errors). Copy the vote links below to share manually.";
  }

  return NextResponse.json({
    ok: true,
    emailSent,
    linksForManual,
    message,
  });
}
