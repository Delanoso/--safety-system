import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getDocumentForUser(id: string, current: { companyId: string | null; role: string }) {
  const doc = await prisma.companyDocument.findUnique({
    where: { id },
    include: { division: true },
  });
  if (!doc) return null;
  if (current.companyId && doc.division.companyId !== current.companyId) return null;
  if (!current.companyId && current.role !== "super") return null;
  return doc;
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const doc = await getDocumentForUser(id, current);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.companyDocument.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const doc = await getDocumentForUser(id, current);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Document name is required" }, { status: 400 });
  }

  const updated = await prisma.companyDocument.update({
    where: { id },
    data: { name },
  });

  return NextResponse.json(updated);
}
