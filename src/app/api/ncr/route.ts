import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const companyId = current.role === "super" ? null : current.companyId ?? null;
    if (current.role !== "super" && !companyId) {
      return NextResponse.json(
        { error: "No company associated with current user" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { error: "Invalid payload: items missing" },
        { status: 400 }
      );
    }

    // Create NCR report
    const report = await prisma.ncrReport.create({
      data: {
        department: "N/A",
        status: "open",
        companyId,
        createdByUserId: current.id,
        items: {
          create: body.items.map((item: any) => ({
            description: item.description || "",
            date: new Date(item.date),
            comment: item.comment || "",
            department: item.department || "",
            images: {
              create: item.images?.map((img: any) => ({
                url: img.url,
              })) || [],
            },
          })),
        },
      },
      include: {
        items: {
          include: {
            images: true,
          },
        },
      },
    });

    console.log("✅ NCR REPORT SAVED:", report.id);

    return NextResponse.json(report, { status: 201 });
  } catch (error: any) {
    console.error("🔥 PRISMA ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Failed to save NCR report" },
      { status: 500 }
    );
  }
}

