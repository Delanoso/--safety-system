import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await prisma.sHECommitteeMeeting.findFirst({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, agenda, minutes, attendees, actionItems } = body;

  const updateData: Record<string, unknown> = {};
  if (date != null) updateData.date = new Date(date);
  if (agenda != null) updateData.agenda = agenda ? String(agenda).trim() : null;
  if (minutes != null) updateData.minutes = minutes ? String(minutes).trim() : null;
  if (attendees != null)
    updateData.attendees =
      typeof attendees === "string"
        ? attendees
        : Array.isArray(attendees)
          ? JSON.stringify(attendees)
          : null;
  if (actionItems != null)
    updateData.actionItems =
      typeof actionItems === "string"
        ? actionItems
        : Array.isArray(actionItems)
          ? JSON.stringify(actionItems)
          : null;

  const result = await prisma.sHECommitteeMeeting.updateMany({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
    data: updateData,
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.sHECommitteeMeeting.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.sHECommitteeMeeting.deleteMany({
    where: {
      id,
      ...(current.companyId ? { companyId: current.companyId } : {}),
    },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
