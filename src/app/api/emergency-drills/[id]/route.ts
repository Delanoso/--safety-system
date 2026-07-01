import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertCompanyAccess, trimOrNull, parseDate } from "@/lib/site-safety-api";
import { DRILL_STATUSES } from "@/lib/emergency-drills";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<string>(DRILL_STATUSES.map((d) => d.value));

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;
    const drill = await prisma.emergencyDrill.findUnique({ where: { id } });
    if (!drill) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertCompanyAccess(current, drill.companyId);
    return NextResponse.json(drill);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((err as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to load drill" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;
    const existing = await prisma.emergencyDrill.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertCompanyAccess(current, existing.companyId);

    const data = await req.json();
    const status = trimOrNull(data.status);
    const drill = await prisma.emergencyDrill.update({
      where: { id },
      data: {
        title: data.title !== undefined ? trimOrNull(data.title) ?? existing.title : undefined,
        location: data.location !== undefined ? trimOrNull(data.location) : undefined,
        department: data.department !== undefined ? trimOrNull(data.department) : undefined,
        coordinator: data.coordinator !== undefined ? trimOrNull(data.coordinator) : undefined,
        findings: data.findings !== undefined ? trimOrNull(data.findings) : undefined,
        correctiveActions:
          data.correctiveActions !== undefined ? trimOrNull(data.correctiveActions) : undefined,
        status: status && VALID_STATUSES.has(status) ? status : undefined,
        drillDate: data.drillDate !== undefined ? parseDate(data.drillDate) ?? undefined : undefined,
        participantCount:
          data.participantCount !== undefined
            ? data.participantCount === "" || data.participantCount == null
              ? null
              : Number(data.participantCount)
            : undefined,
        durationMinutes:
          data.durationMinutes !== undefined
            ? data.durationMinutes === "" || data.durationMinutes == null
              ? null
              : Number(data.durationMinutes)
            : undefined,
        fileUrl: data.fileUrl !== undefined ? trimOrNull(data.fileUrl) : undefined,
      },
    });

    return NextResponse.json(drill);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((err as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update drill" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;
    const drill = await prisma.emergencyDrill.findUnique({
      where: { id },
      select: { companyId: true },
    });
    if (!drill) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertCompanyAccess(current, drill.companyId);
    await prisma.emergencyDrill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((err as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
