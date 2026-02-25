import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function canAccessIncident(incident: { companyId: string | null }, current: { role: string; companyId: string | null } | null) {
  if (!current) return false;
  if (current.role === "super") return true;
  return incident.companyId === current.companyId;
}

/* -------------------------------------------------------
   GET — Fetch a single incident with images + team
------------------------------------------------------- */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let incident: Awaited<ReturnType<typeof prisma.incident.findUnique<{ include: { images: true; team: { select: { id: true; name: true; designation: true; signature: true; signedAt: true; createdAt: true } } } }>>> | null;
    try {
      incident = await prisma.incident.findUnique({
        where: { id },
        include: {
          images: true,
          team: {
            select: {
              id: true,
              name: true,
              designation: true,
              signature: true,
              signedAt: true,
              createdAt: true,
            },
          },
        },
      });
    } catch {
      // e.g. signedAt column missing; retry without it
      incident = await prisma.incident.findUnique({
        where: { id },
        include: {
          images: true,
          team: {
            select: {
              id: true,
              name: true,
              designation: true,
              signature: true,
              createdAt: true,
            },
          },
        },
      }) as typeof incident;
      if (incident?.team) {
        incident.team = incident.team.map((m) => ({ ...m, signedAt: null }));
      }
    }

    if (!incident) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }
    if (!canAccessIncident(incident, current)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Ensure team order is stable (creation order)
    if (incident.team?.length) {
      incident.team = [...incident.team].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.incident.findUnique({
      where: { id },
      select: { companyId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }
    if (!canAccessIncident(existing, current)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Save signature for a team member
    if (body.teamId && body.value) {
      const updated = await prisma.investigationTeamMember.update({
        where: { id: body.teamId },
        data: { signature: body.value, signedAt: new Date() },
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
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.incident.findUnique({
      where: { id },
      select: { companyId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }
    if (!canAccessIncident(existing, current)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

