import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getDivisionForUser(id: string, current: { companyId: string | null; role: string }) {
  const division = await prisma.companyDocumentDivision.findUnique({ where: { id } });
  if (!division) return null;
  if (current.companyId && division.companyId !== current.companyId) return null;
  if (!current.companyId && current.role !== "super") return null;
  return division;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const division = await getDivisionForUser(id, current);
  if (!division) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Division name is required" }, { status: 400 });
  }

  const duplicate = await prisma.companyDocumentDivision.findFirst({
    where: {
      companyId: division.companyId,
      name: { equals: name, mode: "insensitive" },
      NOT: { id },
    },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "A division with this name already exists" },
      { status: 409 }
    );
  }

  const updated = await prisma.companyDocumentDivision.update({
    where: { id },
    data: { name },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const current = await getCurrentUser();
  if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const division = await getDivisionForUser(id, current);
  if (!division) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.companyDocumentDivision.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
