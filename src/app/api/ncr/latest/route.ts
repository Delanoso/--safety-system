import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const where = current.role === "super" ? {} : { companyId: current.companyId ?? undefined };
    const report = await prisma.ncrReport.findFirst({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            images: true,
          },
        },
      },
    });

    return NextResponse.json(report || null);
  } catch (error) {
    console.error("Error loading NCR report:", error);
    return NextResponse.json(
      { error: "Failed to load NCR report" },
      { status: 500 }
    );
  }
}

