import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const person = await prisma.pPEPerson.findUnique({
    where: { id: Number(id) },
    include: { issues: { include: { itemType: true } } },
  });
  if (!person) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(person);
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const name = data.name != null ? String(data.name).trim() : undefined;
  if (name !== undefined && !name) {
    return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
  }
  const person = await prisma.pPEPerson.update({
    where: { id: Number(id) },
    data: {
      ...(name !== undefined && { name }),
      ...(data.email !== undefined && { email: data.email != null ? String(data.email).trim() || null : null }),
      ...(data.phone !== undefined && { phone: data.phone != null ? String(data.phone).trim() || null : null }),
      ...(data.department !== undefined && {
        department: data.department != null ? String(data.department).trim() || null : null,
      }),
      ...(data.subDepartment !== undefined && {
        subDepartment: data.subDepartment != null ? String(data.subDepartment).trim() || null : null,
      }),
      ...(data.sizes !== undefined && { sizes: data.sizes != null ? (typeof data.sizes === "string" ? data.sizes : JSON.stringify(data.sizes)) : null }),
    },
  });
  return NextResponse.json(person);
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await prisma.pPEPerson.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
