import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assertCompanyAccess, trimOrNull, parseDate } from "@/lib/site-safety-api";
import { PERMIT_STATUSES } from "@/lib/site-safety";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<string>(PERMIT_STATUSES.map((p) => p.value));

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;
    const permit = await prisma.permitToWork.findUnique({ where: { id } });
    if (!permit) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertCompanyAccess(current, permit.companyId);
    return NextResponse.json(permit);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((err as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to load permit" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;
    const existing = await prisma.permitToWork.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertCompanyAccess(current, existing.companyId);

    const data = await req.json();
    const status = trimOrNull(data.status);
    const permit = await prisma.permitToWork.update({
      where: { id },
      data: {
        permitNumber: data.permitNumber !== undefined ? trimOrNull(data.permitNumber) : undefined,
        title: data.title !== undefined ? trimOrNull(data.title) ?? existing.title : undefined,
        workDescription:
          data.workDescription !== undefined ? trimOrNull(data.workDescription) : undefined,
        department: data.department !== undefined ? trimOrNull(data.department) : undefined,
        location: data.location !== undefined ? trimOrNull(data.location) : undefined,
        startDate: data.startDate !== undefined ? parseDate(data.startDate) ?? undefined : undefined,
        endDate: data.endDate !== undefined ? parseDate(data.endDate) : undefined,
        hazards: data.hazards !== undefined ? trimOrNull(data.hazards) : undefined,
        controls: data.controls !== undefined ? trimOrNull(data.controls) : undefined,
        status:
          status && VALID_STATUSES.has(status) ? status : undefined,
        issuerName: data.issuerName !== undefined ? trimOrNull(data.issuerName) : undefined,
        receiverName: data.receiverName !== undefined ? trimOrNull(data.receiverName) : undefined,
        fileUrl: data.fileUrl !== undefined ? trimOrNull(data.fileUrl) : undefined,
      },
    });

    return NextResponse.json(permit);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((err as Error).message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update permit" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;
    const permit = await prisma.permitToWork.findUnique({
      where: { id },
      select: { companyId: true },
    });
    if (!permit) return NextResponse.json({ error: "Not found" }, { status: 404 });
    assertCompanyAccess(current, permit.companyId);
    await prisma.permitToWork.delete({ where: { id } });
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
