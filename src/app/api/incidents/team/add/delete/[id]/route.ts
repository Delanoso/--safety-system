import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: memberId } = await context.params;

    const member = await prisma.investigationTeamMember.findUnique({
      where: { id: memberId },
      include: { incident: { select: { companyId: true } } },
    });
    if (!member) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (current.role !== "super" && member.incident.companyId !== current.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
