import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("search")?.trim() ?? "";
  const companyIdParam = url.searchParams.get("companyId");

  let companyId = current.companyId;
  if (current.role === "super" && companyIdParam) {
    companyId = companyIdParam;
  }
  if (!companyId) {
    return NextResponse.json([]);
  }

  const people = await prisma.companyPerson.findMany({
    where: {
      companyId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { surname: { contains: search, mode: "insensitive" } },
              { employeeNumber: { contains: search, mode: "insensitive" } },
              { idNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ surname: "asc" }, { name: "asc" }],
    take: search ? 20 : 500,
  });

  return NextResponse.json(people);
}

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const body = await req.json();

    const {
      name,
      surname,
      employeeNumber,
      idNumber,
      occupation,
      department,
      supervisor,
      contactNumber,
      address,
      companyId: bodyCompanyId,
    } = body as Record<string, string | undefined>;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    let companyId = current.companyId;
    if (current.role === "super" && bodyCompanyId) {
      companyId = bodyCompanyId;
    }
    if (!companyId) {
      return NextResponse.json({ error: "No company associated" }, { status: 400 });
    }

    if (current.role !== "super" && bodyCompanyId && bodyCompanyId !== current.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const person = await prisma.companyPerson.create({
      data: {
        companyId,
        name: name.trim(),
        surname: surname?.trim() || null,
        employeeNumber: employeeNumber?.trim() || null,
        idNumber: idNumber?.trim() || null,
        occupation: occupation?.trim() || null,
        department: department?.trim() || null,
        supervisor: supervisor?.trim() || null,
        contactNumber: contactNumber?.trim() || null,
        address: address?.trim() || null,
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2021") {
        return NextResponse.json(
          { error: "Database not ready. Run database migrations and try again." },
          { status: 503 }
        );
      }
      if (err.code === "P2003") {
        return NextResponse.json(
          { error: "Invalid company. Your account may not be linked to a company." },
          { status: 400 }
        );
      }
    }
    console.error("POST /api/company-people", err);
    return NextResponse.json({ error: "Failed to add person" }, { status: 500 });
  }
}
