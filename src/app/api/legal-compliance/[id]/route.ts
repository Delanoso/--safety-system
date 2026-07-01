import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  companyWhere,
  normalizeStatus,
  trimOrNull,
} from "@/lib/legal-compliance-api";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await prisma.legalComplianceItem.findFirst({
    where: { id, ...companyWhere(current) },
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
  const data: Record<string, unknown> = {};

  if (body.legislation != null) {
    const v = trimOrNull(body.legislation);
    if (!v) return NextResponse.json({ error: "Legislation cannot be empty" }, { status: 400 });
    data.legislation = v;
  }
  if (body.requirement != null) {
    const v = trimOrNull(body.requirement);
    if (!v) return NextResponse.json({ error: "Requirement cannot be empty" }, { status: 400 });
    data.requirement = v;
  }
  if (body.appliesTo !== undefined) data.appliesTo = trimOrNull(body.appliesTo);
  if (body.status != null) {
    const s = normalizeStatus(body.status);
    if (!s) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    data.status = s;
  }
  if (body.responsiblePerson !== undefined) {
    data.responsiblePerson = trimOrNull(body.responsiblePerson);
  }
  if (body.lastReviewedAt !== undefined) {
    data.lastReviewedAt = body.lastReviewedAt ? new Date(body.lastReviewedAt) : null;
  }
  if (body.nextReviewDue !== undefined) {
    data.nextReviewDue = body.nextReviewDue ? new Date(body.nextReviewDue) : null;
  }
  if (body.evidenceUrl !== undefined) data.evidenceUrl = trimOrNull(body.evidenceUrl);
  if (body.evidenceNotes !== undefined) data.evidenceNotes = trimOrNull(body.evidenceNotes);
  if (body.notes !== undefined) data.notes = trimOrNull(body.notes);
  if (body.auditRef !== undefined) data.auditRef = trimOrNull(body.auditRef);
  if (body.section !== undefined) data.section = trimOrNull(body.section);
  if (body.subsection !== undefined) data.subsection = trimOrNull(body.subsection);
  if (body.weight !== undefined) {
    data.weight = body.weight != null && body.weight !== "" ? Number(body.weight) : null;
  }
  if (body.achieved !== undefined) data.achieved = trimOrNull(body.achieved);
  if (body.score !== undefined) {
    data.score = body.score != null && body.score !== "" ? Number(body.score) : null;
  }
  if (body.observations !== undefined) data.observations = trimOrNull(body.observations);

  const result = await prisma.legalComplianceItem.updateMany({
    where: { id, ...companyWhere(current) },
    data,
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.legalComplianceItem.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await prisma.legalComplianceItem.deleteMany({
    where: { id, ...companyWhere(current) },
  });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
