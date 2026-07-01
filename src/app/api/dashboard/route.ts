import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computeContractorCompliance } from "@/lib/contractor-compliance";

export const dynamic = "force-dynamic";

const PPE_LOW_STOCK_THRESHOLD = 5;

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Total incidents
    let incidentWhere: Record<string, unknown> = {};
    if (current.role !== "super") {
      if (current.companyId) incidentWhere.companyId = current.companyId;
    }
    const totalIncidents = await prisma.incident.count({ where: incidentWhere });

    // Unsigned appointments – scoped by company
    const appointmentWhere: { status: { in: string[] }; companyId?: string } = {
      status: {
        in: ["draft", "pending", "appointer_signed", "appointee_signed"],
      },
    };
    if (current.role !== "super" && current.companyId) {
      appointmentWhere.companyId = current.companyId;
    }
    const unsignedAppointments = await prisma.appointment.count({
      where: appointmentWhere,
    });

    // Training compliance – valid certs / total certs (scoped by company)
    const certWhere =
      current.role !== "super" && current.companyId
        ? { companyId: current.companyId }
        : undefined;
    const certificates = await prisma.certificate.findMany({
      where: certWhere,
      select: { expiryDate: true },
    });
    const totalCerts = certificates.length;
    const validCerts = certificates.filter((c) => c.expiryDate >= now).length;
    const trainingCompliance =
      totalCerts === 0 ? 100 : Math.round((validCerts / totalCerts) * 100);

    // PPE stock alerts – scoped by company via itemType
    const ppeWhere =
      current.role !== "super" && current.companyId
        ? { itemType: { companyId: current.companyId } }
        : undefined;
    const stockList = await prisma.pPEStock.findMany({
      where: ppeWhere,
      include: { itemType: true },
    });
    const ppeStockAlerts = stockList.filter((s) => s.quantity <= PPE_LOW_STOCK_THRESHOLD).length;

    // Incidents over time – last 12 months, grouped by month
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const incidents = await prisma.incident.findMany({
      where: { ...incidentWhere, date: { gte: twelveMonthsAgo } },
      select: { date: true },
    });
    const monthCounts: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() - (11 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthCounts[key] = 0;
    }
    for (const inc of incidents) {
      const key = `${inc.date.getFullYear()}-${String(inc.date.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthCounts) monthCounts[key]++;
    }
    const incidentsOverTime = Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Medicals by type – bar chart (scoped by company)
    const medicalWhere =
      current.role !== "super" && current.companyId
        ? { companyId: current.companyId }
        : undefined;
    const medicals = await prisma.medical.findMany({
      where: medicalWhere,
      select: { medicalType: true },
    });
    const typeCounts: Record<string, number> = {};
    for (const m of medicals) {
      const t = m.medicalType || "Unknown";
      typeCounts[t] = (typeCounts[t] ?? 0) + 1;
    }
    const medicalsByType = Object.entries(typeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const companyId =
      current.role !== "super" && current.companyId ? current.companyId : undefined;

    const visitorsOnSite = await prisma.visitorRegisterEntry.count({
      where: {
        checkOutAt: null,
        ...(companyId ? { companyId } : {}),
      },
    });

    const activePermits = await prisma.permitToWork.count({
      where: {
        status: { in: ["active", "issued", "draft"] },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
        ...(companyId ? { companyId } : {}),
      },
    });

    const complianceReviewOverdue = await prisma.legalComplianceItem.count({
      where: {
        nextReviewDue: { lt: now },
        ...(companyId ? { companyId } : {}),
      },
    });

    const contractors = await prisma.contractor.findMany({
      where: companyId ? { companyId } : {},
      include: { documents: { select: { section: true } } },
    });
    let contractorsLowCompliance = 0;
    let avgContractorCompliance = 100;
    if (contractors.length > 0) {
      const scores = contractors.map((c) =>
        computeContractorCompliance(c.documents, c.excludedSections).percentage
      );
      contractorsLowCompliance = scores.filter((s) => s < 80).length;
      avgContractorCompliance = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      );
    }

    const thirtyDaysAhead = new Date(now);
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
    const inductionsExpiringSoon = await prisma.inductionTraining.count({
      where: {
        expiryDate: { gte: now, lte: thirtyDaysAhead },
        ...(companyId ? { companyId } : {}),
      },
    });

    return NextResponse.json({
      totalIncidents,
      unsignedAppointments,
      trainingCompliance,
      ppeStockAlerts,
      incidentsOverTime,
      medicalsByType,
      visitorsOnSite,
      activePermits,
      complianceReviewOverdue,
      contractorsLowCompliance,
      avgContractorCompliance,
      inductionsExpiringSoon,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json(
      {
        totalIncidents: 0,
        unsignedAppointments: 0,
        trainingCompliance: 0,
        ppeStockAlerts: 0,
        incidentsOverTime: [],
        medicalsByType: [],
        visitorsOnSite: 0,
        activePermits: 0,
        complianceReviewOverdue: 0,
        contractorsLowCompliance: 0,
        avgContractorCompliance: 100,
        inductionsExpiringSoon: 0,
      },
      { status: 200 }
    );
  }
}
