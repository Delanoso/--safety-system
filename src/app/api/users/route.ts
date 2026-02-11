import { NextResponse } from "next/server";
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

  let where: any = {};

  if (current.role === "admin") {
    where.companyId = current.companyId ?? undefined;
  } else if (current.role === "super") {
    if (companyIdParam) {
      where.companyId = companyIdParam;
    } else if (allParam === "true") {
      // no extra filter, list all
    } else {
      where.companyId = current.companyId ?? undefined;
    }
  }

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
    }))
  );
}

export async function POST(req: Request) {
  const current = await requireAdminOrSuper();
  const body = await req.json();

  const { email, password, role, companyId } = body as {
    email?: string;
    password?: string;
    role?: "user" | "admin" | "super";
    companyId?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

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

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: role ?? "user",
      companyId: company.id,
    },
  });

  return NextResponse.json(
    {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      companyId: newUser.companyId,
    },
    { status: 201 }
  );
}

