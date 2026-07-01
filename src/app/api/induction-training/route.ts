import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  companyWhere,
  companyIdForCreate,
  trimOrNull,
  parseDate,
} from "@/lib/site-safety-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const current = await requireUser();
    const records = await prisma.inductionTraining.findMany({
      where: companyWhere(current),
      orderBy: { issueDate: "desc" },
    });
    return NextResponse.json(records);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to load inductions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const companyId = companyIdForCreate(current);
    if (current.role !== "super" && !companyId) {
      return NextResponse.json({ error: "No company associated with your account" }, { status: 400 });
    }

    const data = await req.json();
    const employee = trimOrNull(data.employee);
    const inductionType = trimOrNull(data.inductionType);
    const issueDate = parseDate(data.issueDate);
    if (!employee) {
      return NextResponse.json({ error: "Employee name is required." }, { status: 400 });
    }
    if (!inductionType) {
      return NextResponse.json({ error: "Induction type is required." }, { status: 400 });
    }
    if (!issueDate) {
      return NextResponse.json({ error: "Issue date is required." }, { status: 400 });
    }

    const record = await prisma.inductionTraining.create({
      data: {
        employee,
        inductionType,
        issueDate,
        expiryDate: parseDate(data.expiryDate),
        department: trimOrNull(data.department),
        trainer: trimOrNull(data.trainer),
        notes: trimOrNull(data.notes),
        fileUrl: trimOrNull(data.fileUrl),
        status: trimOrNull(data.status) ?? "active",
        companyId,
      },
    });

    return NextResponse.json(record);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Induction create:", err);
    return NextResponse.json({ error: "Failed to save induction" }, { status: 500 });
  }
}
