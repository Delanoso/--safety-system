import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, context) {
  try {
    const { id: memberId } = await context.params;

    await prisma.investigationTeamMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE TEAM MEMBER ERROR:", error);
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    );
  }
}
