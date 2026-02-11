import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const body = await req.json();
  const { companyName, email, password, userLimit } = body as {
    companyName?: string;
    email?: string;
    password?: string;
    userLimit?: number;
  };

  if (!companyName || !email || !password) {
    return NextResponse.json(
      { error: "companyName, email and password are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);

  const company = await prisma.company.create({
    data: {
      name: companyName,
      userLimit: typeof userLimit === "number" && userLimit > 0 ? userLimit : 5,
    },
  });

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role: "admin",
      companyId: company.id,
    },
  });

  return NextResponse.json(
    {
      companyId: company.id,
      userId: user.id,
    },
    { status: 201 }
  );
}

