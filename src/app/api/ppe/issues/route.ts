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
      ? {
          itemType: { companyId: current.companyId },
        }
      : undefined;

  const issues = await prisma.pPEIssue.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { person: true, itemType: true },
  });
  return NextResponse.json(issues);
}

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    data = {};
  }
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const personId = Number(data.personId);
  const itemTypeId = Number(data.itemTypeId);
  const quantity = Number(data.quantity) || 1;
  if (!Number.isInteger(personId) || !Number.isInteger(itemTypeId) || quantity < 1) {
    return NextResponse.json(
      { error: "Valid personId, itemTypeId, and positive quantity required." },
      { status: 400 }
    );
  }

  const [person, itemType] = await Promise.all([
    prisma.pPEPerson.findUnique({
      where: { id: personId },
      include: {
        subDepartmentRelation: {
          include: { department: true },
        },
      },
    }),
    prisma.pPEItemType.findUnique({
      where: { id: itemTypeId },
      select: { companyId: true },
    }),
  ]);

  if (!person) {
    return NextResponse.json({ error: "Person not found." }, { status: 404 });
  }
  if (!itemType) {
    return NextResponse.json({ error: "Item type not found." }, { status: 404 });
  }

  if (current.role !== "super") {
    const itemCompanyId = itemType.companyId;
    const personCompanyId = person.subDepartmentRelation?.department.companyId ?? null;
    if (itemCompanyId && itemCompanyId !== current.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (personCompanyId && personCompanyId !== current.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const issue = await prisma.pPEIssue.create({
    data: {
      personId,
      itemTypeId,
      quantity,
      status: "pending_signature",
    },
    include: { person: true, itemType: true },
  });
  return NextResponse.json(issue);
}
