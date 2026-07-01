import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const DEMO_COMPANIES = [
  {
    companyName: "Demo Company Alpha",
    email: "admin@demoalpha.com",
    password: "DemoAlpha2025!",
  },
  {
    companyName: "Demo Company Beta",
    email: "admin@demobeta.com",
    password: "DemoBeta2025!",
  },
];

/** Create company and admin user; use raw INSERT for user if DB is missing allowedModules/inspectionDepartments. */
async function createCompanyWithAdmin(
  companyName: string,
  email: string,
  hashedPassword: string
): Promise<boolean> {
  const existing = await prisma
    .$queryRaw<{ id: string }[]>(Prisma.sql`SELECT id FROM "User" WHERE email = ${email} LIMIT 1`)
    .catch(() => [] as { id: string }[]);
  if (existing.length > 0) return false;

  const company = await prisma.company.create({
    data: { name: companyName, userLimit: 5 },
  });

  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "admin",
        companyId: company.id,
      },
    });
  } catch {
    const id = randomUUID();
    await prisma.$executeRaw(
      Prisma.sql`INSERT INTO "User" (id, email, password, role, "companyId", "createdAt") VALUES (${id}, ${email}, ${hashedPassword}, ${"admin"}, ${company.id}, CURRENT_TIMESTAMP)`
    );
  }
  return true;
}

/**
 * POST: Create two demo companies with admin users (idempotent).
 * Use from the signup page "Create demo companies" button.
 */
export async function POST() {
  try {
    const created: string[] = [];
    for (const { companyName, email, password } of DEMO_COMPANIES) {
      const hashed = await bcrypt.hash(password, 10);
      const didCreate = await createCompanyWithAdmin(companyName, email, hashed);
      if (didCreate) created.push(companyName);
    }
    return NextResponse.json(
      {
        message:
          created.length > 0
            ? `Created demo companies: ${created.join(", ")}. You can log in with the admin emails and passwords below.`
            : "Demo companies already exist. Use the credentials below to log in.",
        companies: DEMO_COMPANIES.map((c) => ({
          companyName: c.companyName,
          email: c.email,
          password: c.password,
        })),
      },
      { status: created.length > 0 ? 201 : 200 }
    );
  } catch (err) {
    console.error("Create demo companies error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Failed to create demo companies.",
        ...(process.env.NODE_ENV !== "production" && { detail: message }),
      },
      { status: 500 }
    );
  }
}
