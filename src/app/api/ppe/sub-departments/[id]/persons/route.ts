import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const persons = await prisma.pPEPerson.findMany({
    where: { subDepartmentId: Number(id) },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(persons);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const subDepartmentId = Number(id);
  const sub = await prisma.pPESubDepartment.findUnique({
    where: { id: subDepartmentId },
    include: { department: true },
  });
  if (!sub) return NextResponse.json({ error: "Sub-department not found" }, { status: 404 });

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  const name = String(data.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const person = await prisma.pPEPerson.create({
    data: {
      name,
      email: data.email != null ? String(data.email).trim() || null : null,
      phone: data.phone != null ? String(data.phone).trim() || null : null,
      department: sub.department.name,
      subDepartment: sub.name,
      subDepartmentId,
      sizes: data.sizes != null ? (typeof data.sizes === "string" ? data.sizes : JSON.stringify(data.sizes)) : null,
    },
  });
  return NextResponse.json(person);
}
