import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdminOrSuper } from "@/lib/auth";

export async function GET() {
  const current = await getCurrentUser();
  if (!current) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (current.role ?? "").toLowerCase();

  // Super user: see all companies
  if (role === "super") {
    try {
      const companies = await prisma.company.findMany({
        orderBy: { name: "asc" },
        include: { users: true },
      });

      return NextResponse.json(
        companies.map((c) => ({
          id: c.id,
          name: c.name,
          userLimit: c.userLimit,
          userCount: c.users.length,
          logoUrl: c.logoUrl,
        }))
      );
    } catch (err: any) {
      // Fallback for older databases without User.allowedModules / inspectionDepartments
      if (err?.code === "P2022") {
        const rows = await prisma.$queryRaw<
          {
            id: string;
            name: string;
            logoUrl: string | null;
            brandColor: string | null;
            userLimit: number;
            userCount: number;
          }[]
        >(Prisma.sql`
          SELECT 
            c.id,
            c.name,
            c."logoUrl",
            c."brandColor",
            c."userLimit",
            COUNT(u.id) AS "userCount"
          FROM "Company" c
          LEFT JOIN "User" u ON u."companyId" = c.id
          GROUP BY c.id, c.name, c."logoUrl", c."brandColor", c."userLimit"
          ORDER BY c.name ASC
        `);

        return NextResponse.json(
          rows.map((c) => ({
            id: c.id,
            name: c.name,
            userLimit: c.userLimit,
            userCount: Number(c.userCount ?? 0),
            logoUrl: c.logoUrl,
          }))
        );
      }

      throw err;
    }
  }

  // Admins (and optionally normal users) only see their own company
  if (!current.companyId) {
    return NextResponse.json(
      { error: "No company linked to your account" },
      { status: 403 }
    );
  }

  try {
    const companies = await prisma.company.findMany({
      where: { id: current.companyId },
      orderBy: { name: "asc" },
      include: { users: true },
    });

    return NextResponse.json(
      companies.map((c) => ({
        id: c.id,
        name: c.name,
        userLimit: c.userLimit,
        userCount: c.users.length,
        logoUrl: c.logoUrl,
      }))
    );
  } catch (err: any) {
    if (err?.code === "P2022") {
      const rows = await prisma.$queryRaw<
        {
          id: string;
          name: string;
          logoUrl: string | null;
          brandColor: string | null;
          userLimit: number;
          userCount: number;
        }[]
      >(Prisma.sql`
        SELECT 
          c.id,
          c.name,
          c."logoUrl",
          c."brandColor",
          c."userLimit",
          COUNT(u.id) AS "userCount"
        FROM "Company" c
        LEFT JOIN "User" u ON u."companyId" = c.id
        WHERE c.id = ${current.companyId}
        GROUP BY c.id, c.name, c."logoUrl", c."brandColor", c."userLimit"
        ORDER BY c.name ASC
      `);

      return NextResponse.json(
        rows.map((c) => ({
          id: c.id,
          name: c.name,
          userLimit: c.userLimit,
          userCount: Number(c.userCount ?? 0),
          logoUrl: c.logoUrl,
        }))
      );
    }

    throw err;
  }
}

export async function PATCH(req: Request) {
  const current = await requireAdminOrSuper();

  if ((current.role ?? "").toLowerCase() !== "super") {
    return NextResponse.json(
      { error: "Only super users can modify company limits" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { companyId, userLimit } = body as {
    companyId?: string;
    userLimit?: number;
  };

  if (!companyId || typeof userLimit !== "number" || userLimit <= 0) {
    return NextResponse.json(
      { error: "companyId and positive userLimit are required" },
      { status: 400 }
    );
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: { userLimit },
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    userLimit: updated.userLimit,
  });
}

