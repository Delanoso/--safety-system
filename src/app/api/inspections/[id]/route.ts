import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const frequency = searchParams.get("frequency"); // daily | weekly | monthly

    if (!id || !frequency || !["daily", "weekly", "monthly"].includes(frequency)) {
      return NextResponse.json(
        { error: "Missing or invalid id and frequency." },
        { status: 400 }
      );
    }

    const depts = current.inspectionDepartments ?? [];
    const canAccessAnyDepartment = depts.length === 0;

    const checkCompany = (inspection: { department: string; companyId: string | null } | null) => {
      if (!inspection) return false;
      if (current.role === "super") return true;
      if (inspection.companyId !== current.companyId) return false;
      if (!canAccessAnyDepartment && !depts.includes(inspection.department)) return false;
      return true;
    };

    if (frequency === "daily") {
      const inspection = await prisma.dailyInspection.findUnique({
        where: { id },
        select: { department: true, companyId: true },
      });
      if (!inspection) {
        return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
      }
      if (!checkCompany(inspection)) {
        return NextResponse.json(
          { error: "You are not allowed to delete this inspection." },
          { status: 403 }
        );
      }
      await prisma.dailyInspection.delete({ where: { id } });
    } else if (frequency === "weekly") {
      const inspection = await prisma.weeklyInspection.findUnique({
        where: { id },
        select: { department: true, companyId: true },
      });
      if (!inspection) {
        return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
      }
      if (!checkCompany(inspection)) {
        return NextResponse.json(
          { error: "You are not allowed to delete this inspection." },
          { status: 403 }
        );
      }
      await prisma.weeklyInspection.delete({ where: { id } });
    } else {
      const inspection = await prisma.monthlyInspection.findUnique({
        where: { id },
        select: { department: true, companyId: true },
      });
      if (!inspection) {
        return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
      }
      if (!checkCompany(inspection)) {
        return NextResponse.json(
          { error: "You are not allowed to delete this inspection." },
          { status: 403 }
        );
      }
      await prisma.monthlyInspection.delete({ where: { id } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting inspection:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
