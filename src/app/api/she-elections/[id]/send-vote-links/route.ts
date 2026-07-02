import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { prepareWhatsAppDelivery, whatsAppLinkLine } from "@/lib/whatsapp";
import { getPublicBaseUrl } from "@/lib/public-base-url";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: electionId } = await context.params;
    const current = await requireUser();

    const body = await req.json();
    const { voterIds } = body;
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

    const baseUrl = getPublicBaseUrl(req);
    const voters = await prisma.sHEElectionVoter.findMany({
      where: { id: { in: voterIds }, electionId },
    });

    const deliveries: {
      id: string;
      phone: string | null;
      voteUrl: string;
      whatsappUrl: string | null;
      error?: string;
    }[] = [];

    let whatsappPrepared = 0;

    for (const voter of voters) {
      const voteUrl = `${baseUrl}/vote/she/${electionId}?token=${voter.voteToken}`;
      if (voter.votedAt) {
        deliveries.push({
          id: voter.id,
          phone: voter.phone,
          voteUrl,
          whatsappUrl: null,
          error: "Already voted",
        });
        continue;
      }

      if (!voter.phone?.trim()) {
        deliveries.push({
          id: voter.id,
          phone: voter.phone,
          voteUrl,
          whatsappUrl: null,
          error: "No phone number on file",
        });
        continue;
      }

      const message = `You have been invited to vote in the ${election.title} SHE Rep election. Cast your vote here:${whatsAppLinkLine(voteUrl)}\n\nThis link is unique to you. Please do not share it.`;

      try {
        const delivery = prepareWhatsAppDelivery(voter.phone, message);
        whatsappPrepared++;
        deliveries.push({
          id: voter.id,
          phone: voter.phone,
          voteUrl,
          whatsappUrl: delivery.whatsappUrl,
        });
      } catch {
        deliveries.push({
          id: voter.id,
          phone: voter.phone,
          voteUrl,
          whatsappUrl: null,
          error: "Invalid phone number",
        });
      }
    }

    const message =
      whatsappPrepared > 0
        ? `Prepared ${whatsappPrepared} WhatsApp message(s). Open each link below to send.`
        : "No WhatsApp messages prepared. Add phone numbers for voters and try again.";

    return NextResponse.json({
      ok: true,
      whatsappPrepared,
      deliveries,
      linksForManual: deliveries,
      message,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("send-vote-links", err);
    return NextResponse.json({ error: "Failed to prepare vote links" }, { status: 500 });
  }
}

