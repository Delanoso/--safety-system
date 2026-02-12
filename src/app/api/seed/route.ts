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
    const count = await prisma.user.count();
    if (count > 0) {
      return NextResponse.json({
        ok: true,
        message: "Users already exist",
        userCount: count,
      });
    }

    for (const u of SEED_USERS) {
      const hashed = await bcrypt.hash(u.password, 10);
      await prisma.user.create({
        data: { email: u.email, password: hashed, role: u.role },
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Demo users created",
      users: SEED_USERS.map((u) => u.email),
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
