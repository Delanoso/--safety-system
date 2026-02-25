import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const where =
    current.role !== "super" && current.companyId != null
      ? { subDepartmentRelation: { department: { companyId: current.companyId } } }
      : undefined;
  const persons = await prisma.pPEPerson.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      issues: { include: { itemType: true } },
      subDepartmentRelation: {
        include: {
          department: true,
          ppeItemTypes: { include: { itemType: true } },
        },
      },
    },
  });
  return NextResponse.json(persons);
}

export async function POST(req: Request) {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
  const subDepartmentId = data.subDepartmentId != null ? Number(data.subDepartmentId) : null;
  let department: string | null = data.department != null ? String(data.department).trim() || null : null;
  let subDepartment: string | null = data.subDepartment != null ? String(data.subDepartment).trim() || null : null;
  if (subDepartmentId != null && Number.isInteger(subDepartmentId)) {
    const sub = await prisma.pPESubDepartment.findUnique({
      where: { id: subDepartmentId },
      include: { department: true },
    });
    if (sub) {
      if (current.role !== "super" && sub.department.companyId !== current.companyId) {
        return NextResponse.json({ error: "Forbidden: sub-department belongs to another company." }, { status: 403 });
      }
      department = sub.department.name;
      subDepartment = sub.name;
    }
  }
  const person = await prisma.pPEPerson.create({
    data: {
      name,
      email: data.email != null ? String(data.email).trim() || null : null,
      phone: data.phone != null ? String(data.phone).trim() || null : null,
      department,
      subDepartment,
      subDepartmentId: subDepartmentId != null && Number.isInteger(subDepartmentId) ? subDepartmentId : null,
      sizes: data.sizes != null ? (typeof data.sizes === "string" ? data.sizes : JSON.stringify(data.sizes)) : null,
    },
  });
  return NextResponse.json(person);
}
