import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request, context) {
  try {
    const { id: incidentId } = await context.params;
    const { name, designation } = await request.json();

    if (!name || !designation) {
      return NextResponse.json(
        { error: "Name and designation are required" },
        { status: 400 }
      );
    }

    const member = await prisma.investigationTeamMember.create({
      data: {
        name,
        designation,
        incidentId,
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error("CREATE TEAM MEMBER ERROR:", error);
    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}

