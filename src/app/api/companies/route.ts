import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminOrSuper } from "@/lib/auth";

export async function GET() {
  const current = await requireAdminOrSuper();

  // Only super users can see all companies; admins see only their own
  let where: any = {};
  if (current.role === "admin" && current.companyId) {
    where.id = current.companyId;
  }

  const companies = await prisma.company.findMany({
    where,
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
}

export async function PATCH(req: Request) {
  const current = await requireAdminOrSuper();

  if (current.role !== "super") {
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

