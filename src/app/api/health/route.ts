import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();
    return NextResponse.json({
      ok: true,
      database: "connected",
      userCount,
    });
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
