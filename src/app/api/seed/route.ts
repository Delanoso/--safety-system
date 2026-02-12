import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Bootstrap demo users if none exist. Safe to call multiple times.
 * Hit this URL once after deploying if login fails: /api/seed
 */
const SEED_USERS = [
  { email: "erichvandenheuvel5@gmail.com", password: "vandenHeuvel97!", role: "super" as const },
  { email: "demouser1@gmail.com", password: "DemoUser1", role: "super" as const },
];

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const created: string[] = [];
    for (const u of SEED_USERS) {
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (!existing) {
        const hashed = await bcrypt.hash(u.password, 10);
        await prisma.user.create({
          data: { email: u.email, password: hashed, role: u.role },
        });
        created.push(u.email);
      }
    }

    return NextResponse.json({
      ok: true,
      message: created.length > 0 ? "Demo users created" : "Users already exist",
      created,
      userCount: await prisma.user.count(),
    });
  } catch (err) {
    console.error("Seed failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
