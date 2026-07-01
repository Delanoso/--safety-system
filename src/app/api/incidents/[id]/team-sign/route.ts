import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function validateToken(incidentId: string, teamId: string, token: string) {
  const record = await prisma.signatureToken.findFirst({
    where: { incidentId, teamId, token },
  });
  if (!record) return null;
  if (record.expiresAt < new Date()) return null;
  return record;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: incidentId } = await context.params;
  const url = new URL(req.url);
  const teamId = url.searchParams.get("teamId")?.trim() ?? "";
  const token = url.searchParams.get("token")?.trim() ?? "";

  if (!teamId || !token) {
    return NextResponse.json({ error: "Invalid signing link" }, { status: 400 });
  }

  const valid = await validateToken(incidentId, teamId, token);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired signing link" }, { status: 403 });
  }

  const [incident, member] = await Promise.all([
    prisma.incident.findUnique({
      where: { id: incidentId },
      select: { id: true, title: true, type: true, date: true, severity: true },
    }),
    prisma.investigationTeamMember.findFirst({
      where: { id: teamId, incidentId },
      select: { id: true, name: true, designation: true, signature: true, signedAt: true },
    }),
  ]);

  if (!incident || !member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ incident, member });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: incidentId } = await context.params;
  const body = await req.json();
  const teamId = body.teamId != null ? String(body.teamId).trim() : "";
  const token = body.token != null ? String(body.token).trim() : "";
  const signature = body.signature != null ? String(body.signature).trim() : "";

  if (!teamId || !token || !signature) {
    return NextResponse.json({ error: "Missing teamId, token, or signature" }, { status: 400 });
  }

  const valid = await validateToken(incidentId, teamId, token);
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired signing link" }, { status: 403 });
  }

  const updated = await prisma.investigationTeamMember.update({
    where: { id: teamId },
    data: { signature, signedAt: new Date() },
  });

  await prisma.signatureToken.delete({ where: { id: valid.id } });

  return NextResponse.json({ ok: true, member: updated });
}
