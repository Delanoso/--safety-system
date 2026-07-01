import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { isReviewOverdue } from "@/lib/legal-compliance";
import {
  companyWhere,
  normalizeStatus,
  requireCompanyId,
  trimOrNull,
} from "@/lib/legal-compliance-api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const current = await getCurrentUser();
    if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const due = searchParams.get("due");
    const search = searchParams.get("search")?.trim().toLowerCase();
    const legislation = searchParams.get("legislation")?.trim();
    const section = searchParams.get("section")?.trim();

    const items = await prisma.legalComplianceItem.findMany({
      where: companyWhere(current),
      orderBy: [
        { section: "asc" },
        { subsection: "asc" },
        { auditRef: "asc" },
        { requirement: "asc" },
      ],
    });

    let filtered = items;

    if (status && status !== "all") {
      filtered = filtered.filter((i) => i.status === status);
    }

    if (legislation && legislation !== "all") {
      filtered = filtered.filter((i) => i.legislation === legislation);
    }

    if (section && section !== "all") {
      filtered = filtered.filter((i) => i.section === section);
    }

    if (due === "overdue") {
      filtered = filtered.filter((i) => isReviewOverdue(i.nextReviewDue));
    } else if (due === "due_soon") {
      const in30 = new Date();
      in30.setDate(in30.getDate() + 30);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((i) => {
        if (!i.nextReviewDue) return false;
        const d = new Date(i.nextReviewDue);
        d.setHours(0, 0, 0, 0);
        return d >= today && d <= in30;
      });
    }

    if (search) {
      filtered = filtered.filter((i) => {
        const hay = [
          i.auditRef,
          i.section,
          i.subsection,
          i.legislation,
          i.requirement,
          i.appliesTo,
          i.responsiblePerson,
          i.observations,
          i.evidenceNotes,
          i.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(search);
      });
    }

    const stats = {
      total: items.length,
      compliant: items.filter((i) => i.status === "compliant").length,
      nonCompliant: items.filter((i) => i.status === "non_compliant").length,
      overdueReview: items.filter((i) => isReviewOverdue(i.nextReviewDue)).length,
      auditScoreTotal: items.reduce((sum, i) => sum + (i.score ?? 0), 0),
      auditWeightTotal: items.reduce((sum, i) => sum + (i.weight ?? 0), 0),
    };

    const sections = [...new Set(items.map((i) => i.section).filter(Boolean))].sort();

    return NextResponse.json({ items: filtered, stats, sections });
  } catch (err) {
    console.error("Legal compliance GET:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const current = await requireUser();
    const body = await req.json();

    const companyId = requireCompanyId(current, body.companyId);
    if (!companyId && current.role !== "super") {
      return NextResponse.json(
        { error: "No company associated with user" },
        { status: 400 }
      );
    }

    const legislation = trimOrNull(body.legislation);
    const requirement = trimOrNull(body.requirement);
    if (!legislation || !requirement) {
      return NextResponse.json(
        { error: "Legislation and requirement are required" },
        { status: 400 }
      );
    }

    const status = normalizeStatus(body.status) ?? "under_review";

    const item = await prisma.legalComplianceItem.create({
      data: {
        companyId,
        auditRef: trimOrNull(body.auditRef),
        section: trimOrNull(body.section),
        subsection: trimOrNull(body.subsection),
        legislation,
        requirement,
        appliesTo: trimOrNull(body.appliesTo),
        status,
        weight: body.weight != null && body.weight !== "" ? Number(body.weight) : null,
        achieved: trimOrNull(body.achieved),
        score: body.score != null && body.score !== "" ? Number(body.score) : null,
        observations: trimOrNull(body.observations),
        responsiblePerson: trimOrNull(body.responsiblePerson),
        lastReviewedAt: body.lastReviewedAt ? new Date(body.lastReviewedAt) : null,
        nextReviewDue: body.nextReviewDue ? new Date(body.nextReviewDue) : null,
        evidenceUrl: trimOrNull(body.evidenceUrl),
        evidenceNotes: trimOrNull(body.evidenceNotes),
        notes: trimOrNull(body.notes),
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("Legal compliance POST:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
