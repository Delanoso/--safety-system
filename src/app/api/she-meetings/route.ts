import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const where: { companyId?: string | null } = {};
    if (current.companyId) where.companyId = current.companyId;

    const items = await prisma.sHECommitteeMeeting.findMany({
      where,
      orderBy: { date: "desc" },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("SHE meetings GET:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const body = await req.json();

    const companyId = current.companyId ?? null;
    if (!companyId && current.role !== "super") {
      return NextResponse.json(
        { error: "No company associated with user" },
        { status: 400 }
      );
    }

    const { date, agenda, minutes, attendees, actionItems } = body;
    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const item = await prisma.sHECommitteeMeeting.create({
      data: {
        date: new Date(date),
        agenda: agenda ? String(agenda).trim() : null,
        minutes: minutes ? String(minutes).trim() : null,
        attendees:
          typeof attendees === "string"
            ? attendees
            : Array.isArray(attendees)
              ? JSON.stringify(attendees)
              : null,
        actionItems:
          typeof actionItems === "string"
            ? actionItems
            : Array.isArray(actionItems)
              ? JSON.stringify(actionItems)
              : null,
        companyId: companyId ?? body.companyId ?? null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("SHE meeting POST:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
