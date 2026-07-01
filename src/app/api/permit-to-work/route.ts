import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  companyWhere,
  companyIdForCreate,
  trimOrNull,
  parseDate,
} from "@/lib/site-safety-api";
import { PERMIT_STATUSES, PERMIT_TYPES } from "@/lib/site-safety";

export const dynamic = "force-dynamic";

const VALID_PERMIT_TYPES = new Set<string>(PERMIT_TYPES.map((p) => p.value));
const VALID_STATUSES = new Set<string>(PERMIT_STATUSES.map((p) => p.value));

export async function GET() {
  try {
    const current = await requireUser();
    const permits = await prisma.permitToWork.findMany({
      where: companyWhere(current),
      orderBy: { startDate: "desc" },
    });
    return NextResponse.json(permits);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load permits" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const companyId = companyIdForCreate(current);
    if (current.role !== "super" && !companyId) {
      return NextResponse.json({ error: "No company associated with your account" }, { status: 400 });
    }

    const data = await req.json();
    const title = trimOrNull(data.title);
    const permitType = trimOrNull(data.permitType);
    const startDate = parseDate(data.startDate);
    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!permitType || !VALID_PERMIT_TYPES.has(permitType)) {
      return NextResponse.json({ error: "Valid permit type is required." }, { status: 400 });
    }
    if (!startDate) {
      return NextResponse.json({ error: "Start date is required." }, { status: 400 });
    }

    const status = trimOrNull(data.status);
    const permit = await prisma.permitToWork.create({
      data: {
        permitNumber: trimOrNull(data.permitNumber),
        permitType,
        title,
        workDescription: trimOrNull(data.workDescription),
        department: trimOrNull(data.department),
        location: trimOrNull(data.location),
        startDate,
        endDate: parseDate(data.endDate),
        hazards: trimOrNull(data.hazards),
        controls: trimOrNull(data.controls),
        status: status && VALID_STATUSES.has(status) ? status : "draft",
        issuerName: trimOrNull(data.issuerName),
        receiverName: trimOrNull(data.receiverName),
        fileUrl: trimOrNull(data.fileUrl),
        companyId,
      },
    });

    return NextResponse.json(permit);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Permit create:", err);
    return NextResponse.json({ error: "Failed to save permit" }, { status: 500 });
  }
}
