import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  companyWhere,
  companyIdForCreate,
  trimOrNull,
  parseDate,
} from "@/lib/site-safety-api";
import { DRILL_STATUSES, DRILL_TYPES } from "@/lib/emergency-drills";

export const dynamic = "force-dynamic";

const VALID_TYPES = new Set<string>(DRILL_TYPES.map((d) => d.value));
const VALID_STATUSES = new Set<string>(DRILL_STATUSES.map((d) => d.value));

export async function GET() {
  try {
    const current = await requireUser();
    const drills = await prisma.emergencyDrill.findMany({
      where: companyWhere(current),
      orderBy: { drillDate: "desc" },
    });
    return NextResponse.json(drills);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Emergency drills list:", err);
    return NextResponse.json({ error: "Failed to load emergency drills" }, { status: 500 });
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
    const drillType = trimOrNull(data.drillType);
    const drillDate = parseDate(data.drillDate);

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!drillType || !VALID_TYPES.has(drillType)) {
      return NextResponse.json({ error: "Valid drill type is required." }, { status: 400 });
    }
    if (!drillDate) {
      return NextResponse.json({ error: "Drill date is required." }, { status: 400 });
    }

    const status = trimOrNull(data.status);
    const drill = await prisma.emergencyDrill.create({
      data: {
        drillType,
        title,
        drillDate,
        location: trimOrNull(data.location),
        department: trimOrNull(data.department),
        coordinator: trimOrNull(data.coordinator),
        participantCount:
          data.participantCount != null && data.participantCount !== ""
            ? Number(data.participantCount)
            : null,
        durationMinutes:
          data.durationMinutes != null && data.durationMinutes !== ""
            ? Number(data.durationMinutes)
            : null,
        findings: trimOrNull(data.findings),
        correctiveActions: trimOrNull(data.correctiveActions),
        status: status && VALID_STATUSES.has(status) ? status : "completed",
        fileUrl: trimOrNull(data.fileUrl),
        companyId,
      },
    });

    return NextResponse.json(drill);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Emergency drill create:", err);
    return NextResponse.json({ error: "Failed to save emergency drill" }, { status: 500 });
  }
}
