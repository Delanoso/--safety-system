import { NextResponse } from "next/server";
import { Prisma } from "prisma-client-generated";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
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

    const existing = await prisma
      .$queryRaw<{ id: string }[]>(Prisma.sql`SELECT id FROM "User" WHERE email = ${email} LIMIT 1`)
      .catch(() => [] as { id: string }[]);
    if (existing.length > 0) {
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

    try {
      await prisma.user.create({
        data: {
          email,
          password: hashed,
          role: "admin",
          companyId: company.id,
        },
      });
    } catch {
      const userId = randomUUID();
      await prisma.$executeRaw(
        Prisma.sql`INSERT INTO "User" (id, email, password, role, "companyId", "createdAt") VALUES (${userId}, ${email}, ${hashed}, ${"admin"}, ${company.id}, CURRENT_TIMESTAMP)`
      );
    }

    return NextResponse.json(
      {
        companyId: company.id,
        message: "Company registered successfully. You can now log in as the admin.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register company error:", err);
    return NextResponse.json(
      { error: "Failed to register company. Please try again." },
      { status: 500 }
    );
  }
}

