import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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

    // Unsigned appointments – still need one or more signatures
    const unsignedAppointments = await prisma.appointment.count({
      where: {
        status: {
          in: ["draft", "pending", "appointer_signed", "appointee_signed"],
        },
      },
    });

    // Training compliance – valid certs / total certs
    const certificates = await prisma.certificate.findMany();
    const totalCerts = certificates.length;
    const validCerts = certificates.filter((c) => c.expiryDate >= now).length;
    const trainingCompliance =
      totalCerts === 0 ? 100 : Math.round((validCerts / totalCerts) * 100);

    // PPE stock alerts – item types with quantity <= threshold
    const stockList = await prisma.pPEStock.findMany({ include: { itemType: true } });
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

    // Medicals by type – bar chart
    const medicals = await prisma.medical.findMany({ select: { medicalType: true } });
    const typeCounts: Record<string, number> = {};
    for (const m of medicals) {
      const t = m.medicalType || "Unknown";
      typeCounts[t] = (typeCounts[t] ?? 0) + 1;
    }
    const medicalsByType = Object.entries(typeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return NextResponse.json({
      totalIncidents,
      unsignedAppointments,
      trainingCompliance,
      ppeStockAlerts,
      incidentsOverTime,
      medicalsByType,
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
      },
      { status: 200 }
    );
  }
}
