import { NextResponse } from "next/server";
import { Prisma } from "prisma-client-generated";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentUser, requireAdminOrSuper } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const companyIdParam = url.searchParams.get("companyId");
  const allParam = url.searchParams.get("all");

  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Normal users cannot list other users
  if (current.role === "user") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let where: { companyId?: string } = {};

  if (current.role === "admin") {
    if (current.companyId) where.companyId = current.companyId;
  } else if (current.role === "super") {
    if (companyIdParam) {
      where.companyId = companyIdParam;
    } else if (allParam === "true") {
      // no extra filter, list all
    } else {
      if (current.companyId) where.companyId = current.companyId;
    }
  }

  try {
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: { company: true },
    });

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        companyId: u.companyId,
        companyName: u.company?.name ?? null,
        createdAt: u.createdAt,
        allowedModules: u.allowedModules ? (JSON.parse(u.allowedModules) as string[]) : null,
        inspectionDepartments: u.inspectionDepartments ? (JSON.parse(u.inspectionDepartments) as string[]) : [],
      }))
    );
  } catch (err: any) {
    // Fallback for older databases without allowedModules / inspectionDepartments columns
    if (err?.code === "P2022") {
      const conditions: Prisma.Sql[] = [];
      if (where.companyId) {
        conditions.push(Prisma.sql`u."companyId" = ${where.companyId}`);
      }

      const whereSql =
        conditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
          : Prisma.sql``;

      const rows = await prisma.$queryRaw<
        {
          id: string;
          email: string;
          role: string;
          companyId: string | null;
          companyName: string | null;
          createdAt: Date;
        }[]
      >(
        Prisma.sql`
          SELECT 
            u.id,
            u.email,
            u.role,
            u."companyId",
            u."createdAt",
            c.name AS "companyName"
          FROM "User" u
          LEFT JOIN "Company" c ON u."companyId" = c.id
          ${whereSql}
          ORDER BY u."createdAt" ASC
        `
      );

      return NextResponse.json(
        rows.map((u) => ({
          id: u.id,
          email: u.email,
          role: u.role,
          companyId: u.companyId,
          companyName: u.companyName ?? null,
          createdAt: u.createdAt,
          // Columns don't exist in this database version
          allowedModules: null,
          inspectionDepartments: [],
        }))
      );
    }

    throw err;
  }
}

export async function POST(req: Request) {
  const current = await requireAdminOrSuper();
  const body = await req.json();

  const { email, password, role, companyId, allowedModules: allowedModulesBody, inspectionDepartments: inspectionDepartmentsBody } = body as {
    email?: string;
    password?: string;
    role?: "user" | "admin" | "super";
    companyId?: string;
    allowedModules?: string[] | null;
    inspectionDepartments?: string[] | null;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

  const inspectionDepts = Array.isArray(inspectionDepartmentsBody)
    ? inspectionDepartmentsBody.filter((x) => typeof x === "string").map((s) => String(s).trim()).filter(Boolean)
    : [];
  // Empty = user can view all departments (e.g. demo user). No longer required.

  if (current.role === "admin" && role === "super") {
    return NextResponse.json(
      { error: "Admins cannot create super users" },
      { status: 403 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 400 }
    );
  }

  // Resolve target company
  let targetCompanyId: string | null = null;

  if (current.role === "admin") {
    targetCompanyId = current.companyId;
  } else if (current.role === "super") {
    targetCompanyId = companyId ?? current.companyId ?? null;
  }

  if (!targetCompanyId) {
    return NextResponse.json(
      { error: "Target company could not be determined for this user" },
      { status: 400 }
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: targetCompanyId },
    include: { users: true },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Target company not found" },
      { status: 400 }
    );
  }

  const currentCount = company.users.length;
  if (currentCount >= company.userLimit) {
    return NextResponse.json(
      {
        error: `User limit reached (${company.userLimit}). Cannot create more users for this company.`,
      },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const allowedModulesJson =
    allowedModulesBody === null || (Array.isArray(allowedModulesBody) && allowedModulesBody.length === 0)
      ? null
      : Array.isArray(allowedModulesBody)
        ? JSON.stringify(allowedModulesBody.filter((x) => typeof x === "string"))
        : null;

  const inspectionDepartmentsJson = inspectionDepts.length > 0 ? JSON.stringify(inspectionDepts) : null;

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: role ?? "user",
      companyId: company.id,
      allowedModules: allowedModulesJson,
      inspectionDepartments: inspectionDepartmentsJson,
    },
  });

  return NextResponse.json(
    {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      companyId: newUser.companyId,
      allowedModules: newUser.allowedModules ? (JSON.parse(newUser.allowedModules) as string[]) : null,
      inspectionDepartments: newUser.inspectionDepartments ? (JSON.parse(newUser.inspectionDepartments) as string[]) : [],
    },
    { status: 201 }
  );
}

