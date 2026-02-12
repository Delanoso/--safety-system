import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const persons = await prisma.pPEPerson.findMany({
    orderBy: { name: "asc" },
    include: { issues: { include: { itemType: true } } },
  });
  return NextResponse.json(persons);
}

export async function POST(req: Request) {
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
      department: data.department != null ? String(data.department).trim() || null : null,
      subDepartment: data.subDepartment != null ? String(data.subDepartment).trim() || null : null,
      sizes: data.sizes != null ? (typeof data.sizes === "string" ? data.sizes : JSON.stringify(data.sizes)) : null,
    },
  });
  return NextResponse.json(person);
}
