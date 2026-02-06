import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* -------------------------------------------------------
   GET — Fetch a single incident with images + team
------------------------------------------------------- */
export async function GET(request, context) {
  try {
    const { id } = await context.params;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        images: true,
        team: true,
      },
    });

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(incident);
  } catch (error) {
    console.error("GET INCIDENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch incident" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------
   PATCH — Update incident status OR save signature
------------------------------------------------------- */
export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Save signature for a team member
    if (body.teamId && body.value) {
      const updated = await prisma.investigationTeamMember.update({
        where: { id: body.teamId },
        data: { signature: body.value },
      });

      return NextResponse.json({ success: true, updated });
    }

    // Update incident status
    if (body.status) {
      const updated = await prisma.incident.update({
        where: { id },
        data: { status: body.status },
      });

      return NextResponse.json({ success: true, updated });
    }

    return NextResponse.json(
      { success: false, error: "Invalid PATCH payload" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH INCIDENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update incident" },
      { status: 500 }
    );
  }
}

/* -------------------------------------------------------
   DELETE — Remove entire incident
------------------------------------------------------- */
export async function DELETE(request, context) {
  try {
    const { id } = await context.params;

    await prisma.investigationTeamMember.deleteMany({
      where: { incidentId: id },
    });

    await prisma.incidentImage.deleteMany({
      where: { incidentId: id },
    });

    await prisma.incident.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE INCIDENT ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete incident" },
      { status: 500 }
    );
  }
}

