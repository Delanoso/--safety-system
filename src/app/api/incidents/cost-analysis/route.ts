import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      linkId,
      incidentId,
      directCost,
      indirectCost,
      otherCost,
      notes,
    } = body;

    const total =
      (directCost || 0) + (indirectCost || 0) + (otherCost || 0);

    const ca = await prisma.costAnalysis.create({
      data: {
        linkId: linkId || null,
        incidentId: incidentId || null,
        directCost,
        indirectCost,
        otherCost,
        totalCost: total,
        notes,
      },
    });

    return NextResponse.json(ca, { status: 201 });
  } catch (error: any) {
    console.error("Error creating cost analysis:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create cost analysis" },
      { status: 500 }
    );
  }
}
