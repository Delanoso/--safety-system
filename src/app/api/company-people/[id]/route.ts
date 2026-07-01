import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const current = await requireUser();
    const { id } = await context.params;

    const person = await prisma.companyPerson.findUnique({ where: { id } });
    if (!person) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (current.role !== "super" && person.companyId !== current.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.companyPerson.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DELETE /api/company-people", err);
    return NextResponse.json({ error: "Failed to remove person" }, { status: 500 });
  }
}
