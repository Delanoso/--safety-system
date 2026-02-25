import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const emptyDashboard = {
  totalPeople: 0,
  totalStockQuantity: 0,
  totalStockItems: 0,
  lowStockAlerts: [] as { id: number; name: string; quantity: number; minThreshold: number }[],
  pendingSignaturesCount: 0,
  issuesTodayCount: 0,
  issuesToday: [] as { id: number; quantity: number; person: { name: string }; itemType: { name: string } }[],
  recentMovements: [] as { id: number; movementType: string; quantityDelta: number; quantityAfter: number; reason: string | null; createdAt: string; itemType: { name: string } }[],
};

export async function GET() {
  let current;
  try {
    current = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const companyWhere =
    current.role !== "super" && current.companyId != null
      ? { companyId: current.companyId }
      : undefined;
  const personWhere =
    companyWhere != null
      ? { subDepartmentRelation: { department: { companyId: current.companyId! } } }
      : undefined;
  const itemTypeWhere = companyWhere != null ? { itemType: { companyId: current.companyId! } } : undefined;

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [peopleCount, stockRows, issues, pendingIssues] = await Promise.all([
      prisma.pPEPerson.count({ where: personWhere }),
      prisma.pPEStock.findMany({
        where: itemTypeWhere,
        include: { itemType: true },
        orderBy: { itemType: { name: "asc" } },
      }),
      prisma.pPEIssue.findMany({
        where: {
          issueDate: { gte: todayStart },
          ...(companyWhere != null
            ? {
                person: { subDepartmentRelation: { department: { companyId: current.companyId! } } },
                itemType: { companyId: current.companyId! },
              }
            : {}),
        },
        include: { person: true, itemType: true },
      }),
      prisma.pPEIssue.count({
        where: {
          status: "pending_signature",
          ...(companyWhere != null
            ? {
                person: { subDepartmentRelation: { department: { companyId: current.companyId! } } },
                itemType: { companyId: current.companyId! },
              }
            : {}),
        },
      }),
    ]);

    let movements = emptyDashboard.recentMovements;
    try {
      const rows = await prisma.pPEStockMovement.findMany({
        where: itemTypeWhere,
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { itemType: true },
      });
      movements = rows.map((r) => ({
        id: r.id,
        movementType: r.movementType,
        quantityDelta: r.quantityDelta,
        quantityAfter: r.quantityAfter,
        reason: r.reason,
        createdAt: r.createdAt.toISOString(),
        itemType: { name: r.itemType.name },
      }));
    } catch {
      // PPEStockMovement table may not exist yet; ignore
    }

    const totalStockQuantity = stockRows.reduce((sum, s) => sum + s.quantity, 0);
    const itemTypeWithMin = (s: { itemType: { name: string; minStockThreshold?: number | null }; itemTypeId: number; quantity: number }) =>
      (s.itemType as { minStockThreshold?: number | null }).minStockThreshold ?? 5;
    const lowStockAlerts = stockRows
      .filter((s) => s.quantity <= itemTypeWithMin(s))
      .map((s) => ({
        id: s.itemTypeId,
        name: s.itemType.name,
        quantity: s.quantity,
        minThreshold: itemTypeWithMin(s),
      }));

    return NextResponse.json({
      totalPeople: peopleCount,
      totalStockQuantity,
      totalStockItems: stockRows.length,
      lowStockAlerts,
      pendingSignaturesCount: pendingIssues,
      issuesTodayCount: issues.length,
      issuesToday: issues.slice(0, 10),
      recentMovements: movements,
    });
  } catch (err) {
    console.error("PPE dashboard API error:", err);
    return NextResponse.json(emptyDashboard);
  }
}
