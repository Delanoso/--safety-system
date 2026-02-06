import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const report = await prisma.ncrReport.findFirst({
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

