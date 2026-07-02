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
    const current = await requireUser();
    const { id: incidentId } = await context.params;
    const body = await req.json();
    const phone = body.phone != null ? String(body.phone).trim() : "";
    const teamId = body.teamId != null ? String(body.teamId).trim() : "";

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }
    if (!teamId) {
      return NextResponse.json({ error: "Team member id is required" }, { status: 400 });
    }

    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
      select: { id: true, title: true, companyId: true },
    });
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }
    if (current.role !== "super" && incident.companyId !== current.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const member = await prisma.investigationTeamMember.findFirst({
      where: { id: teamId, incidentId },
    });
    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.signatureToken.create({
      data: { token, teamId, incidentId, expiresAt },
    });

    const baseUrl = getPublicBaseUrl(req);
    const signUrl = `${baseUrl}/incidents/sign/${incidentId}?teamId=${teamId}&token=${token}`;

    const message = `Hi ${member.name}, please review and sign the incident investigation "${incident.title}":${whatsAppLinkLine(signUrl)}`;

    let delivery;
    try {
      delivery = prepareWhatsAppDelivery(phone, message);
    } catch {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      whatsappUrl: delivery.whatsappUrl,
      signUrl,
      message: "Open WhatsApp to send the signature request.",
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST send-signature-request", err);
    return NextResponse.json({ error: "Failed to prepare WhatsApp message" }, { status: 500 });
  }
}
