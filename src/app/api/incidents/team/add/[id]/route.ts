import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: incidentId } = await context.params;
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
      select: { companyId: true },
    });
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }
    if (current.role !== "super" && incident.companyId !== current.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, designation, signature } = body;
    const signatureValue = typeof signature === "string" && signature.trim() ? signature.trim() : null;

    if (!name || !designation) {
      return NextResponse.json(
        { error: "Name and designation are required" },
        { status: 400 }
      );
    }

    // Create member with signature in one write so it always matches this request
    const created = await prisma.investigationTeamMember.create({
      data: {
        name: String(name).trim(),
        designation: String(designation).trim(),
        incidentId,
        signature: signatureValue,
      },
    });

    if (signatureValue) {
      try {
        await prisma.investigationTeamMember.update({
          where: { id: created.id },
          data: { signedAt: new Date() },
        });
      } catch {
        // signedAt column may not exist yet; member and signature are already saved
      }
    }

    // Return refetched row so client gets exactly what is stored (including signature)
    let member = created;
    try {
      const refetched = await prisma.investigationTeamMember.findUnique({
        where: { id: created.id },
        select: { id: true, name: true, designation: true, signature: true, signedAt: true, createdAt: true },
      });
      if (refetched) member = refetched;
    } catch {
      // e.g. signedAt column missing; use created
    }

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error("CREATE TEAM MEMBER ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}

