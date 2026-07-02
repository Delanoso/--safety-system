import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { computeContractorCompliance } from "@/lib/contractor-compliance";
import {
  getExpiringPermitReminders,
  getHazardousChemicalsNoSdsReminders,
  getInspectionDueReminders,
  getMaintenanceDueReminders,
  getPlannedDrillReminders,
  getRiskAssessmentReviewReminders,
  getSheMeetingActionReminders,
  getUnsignedIncidentTeamReminders,
  getUnsignedToolboxAttendeeReminders,
  getVisitorsOnSiteReminders,
} from "@/lib/notification-reminders";

export const dynamic = "force-dynamic";

const DAYS_AHEAD = 30;

function emptyNotifications() {
  return {
    expiringCertificates: [],
    expiringMedicals: [],
    unsignedAppointments: [],
    unsignedPpeIssues: [],
    expiringInductions: [],
    complianceReviewDue: [],
    contractorsLowCompliance: [],
    maintenanceDue: [],
    inspectionsDue: [],
    expiringPermits: [],
    visitorsOnSite: [],
    unsignedToolboxAttendees: [],
    hazardousChemicalsNoSds: [],
    plannedDrills: [],
    riskAssessmentsReviewDue: [],
    sheMeetingActionsDue: [],
    unsignedIncidentTeam: [],
    total: 0,
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(emptyNotifications());
    }
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { notificationsEnabled: true, inspectionDepartments: true },
    });
    const notificationsEnabled = dbUser?.notificationsEnabled ?? true;
    if (!notificationsEnabled) {
      return NextResponse.json(emptyNotifications());
    }

    // Scope by company: non-super users only see their company's data
    const companyFilter =
      user && user.role !== "super" && user.companyId != null
        ? { companyId: user.companyId }
        : undefined;

    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + DAYS_AHEAD);

    // Certificates expiring in 30 days
    const expiringCerts = await prisma.certificate.findMany({
      where: {
        expiryDate: { gte: now, lte: cutoff },
        ...(companyFilter && { companyId: companyFilter.companyId }),
      },
      orderBy: { expiryDate: "asc" },
      select: {
        id: true,
        employee: true,
        certificateName: true,
        expiryDate: true,
      },
    });

    // Medicals expiring in 30 days
    const expiringMedicals = await prisma.medical.findMany({
      where: {
        expiryDate: { gte: now, lte: cutoff },
        ...(companyFilter && { companyId: companyFilter.companyId }),
      },
      orderBy: { expiryDate: "asc" },
      select: {
        id: true,
        employee: true,
        medicalType: true,
        expiryDate: true,
      },
    });

    // Appointments not yet fully signed (draft, pending, or partially signed)
    const unsignedAppointments = await prisma.appointment.findMany({
      where: {
        status: {
          notIn: ["completed", "signed"],
        },
        ...(companyFilter && { companyId: companyFilter.companyId }),
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        type: true,
        appointee: true,
        appointer: true,
        status: true,
        date: true,
      },
    });

    // PPE issues pending signature (scoped via itemType.companyId)
    const unsignedPpeIssues = await prisma.pPEIssue.findMany({
      where: {
        status: "pending_signature",
        ...(companyFilter && {
          itemType: { companyId: companyFilter.companyId },
        }),
      },
      include: {
        person: { select: { name: true } },
        itemType: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const expiringInductions = await prisma.inductionTraining.findMany({
      where: {
        expiryDate: { gte: now, lte: cutoff },
        ...(companyFilter && { companyId: companyFilter.companyId }),
      },
      orderBy: { expiryDate: "asc" },
      select: {
        id: true,
        employee: true,
        inductionType: true,
        expiryDate: true,
      },
    });

    const complianceReviewDue = await prisma.legalComplianceItem.findMany({
      where: {
        nextReviewDue: { lte: cutoff },
        ...(companyFilter && { companyId: companyFilter.companyId }),
      },
      orderBy: { nextReviewDue: "asc" },
      take: 20,
      select: {
        id: true,
        legislation: true,
        requirement: true,
        nextReviewDue: true,
        auditRef: true,
      },
    });

    const contractors = await prisma.contractor.findMany({
      where: companyFilter ? { companyId: companyFilter.companyId } : {},
      include: { documents: { select: { section: true } } },
    });
    const contractorsLowCompliance = contractors
      .map((c) => ({
        contractor: c,
        compliance: computeContractorCompliance(c.documents, c.excludedSections),
      }))
      .filter((x) => x.compliance.percentage < 80)
      .slice(0, 10);

    const inspectionDepts: string[] = (() => {
      const raw = dbUser?.inspectionDepartments;
      if (!raw?.trim()) return [];
      try {
        const parsed = JSON.parse(raw) as unknown;
        return Array.isArray(parsed)
          ? parsed.filter((x): x is string => typeof x === "string")
          : [];
      } catch {
        return [];
      }
    })();
    const allowedDepartments =
      inspectionDepts.length > 0 ? inspectionDepts : null;

    const [
      maintenanceDue,
      inspectionsDue,
      expiringPermits,
      visitorsOnSite,
      unsignedToolboxAttendees,
      hazardousChemicalsNoSds,
      plannedDrills,
      riskAssessmentsReviewDue,
      sheMeetingActionsDue,
      unsignedIncidentTeam,
    ] = await Promise.all([
      getMaintenanceDueReminders({
        companyId: companyFilter?.companyId,
        now,
        daysAhead: DAYS_AHEAD,
      }),
      getInspectionDueReminders({
        companyId: companyFilter?.companyId,
        allowedDepartments,
        now,
      }),
      getExpiringPermitReminders({
        companyId: companyFilter?.companyId,
        now,
        daysAhead: DAYS_AHEAD,
      }),
      getVisitorsOnSiteReminders({
        companyId: companyFilter?.companyId,
        now,
      }),
      getUnsignedToolboxAttendeeReminders({
        companyId: companyFilter?.companyId,
        now,
      }),
      getHazardousChemicalsNoSdsReminders({
        companyId: companyFilter?.companyId,
      }),
      getPlannedDrillReminders({
        companyId: companyFilter?.companyId,
        now,
        daysAhead: DAYS_AHEAD,
      }),
      getRiskAssessmentReviewReminders({
        companyId: companyFilter?.companyId,
        now,
        daysAhead: DAYS_AHEAD,
      }),
      getSheMeetingActionReminders({
        companyId: companyFilter?.companyId,
        now,
        daysAhead: DAYS_AHEAD,
      }),
      getUnsignedIncidentTeamReminders({
        companyId: companyFilter?.companyId,
      }),
    ]);

    return NextResponse.json({
      expiringCertificates: expiringCerts.map((c) => ({
        id: `cert-${c.id}`,
        type: "certificate_expiring" as const,
        title: `${c.certificateName} – ${c.employee}`,
        subtitle: `Expires ${c.expiryDate.toLocaleDateString()}`,
        href: `/training/certificates/list?id=${c.id}`,
        date: c.expiryDate,
      })),
      expiringMedicals: expiringMedicals.map((m) => ({
        id: `med-${m.id}`,
        type: "medical_expiring" as const,
        title: `${m.medicalType} – ${m.employee}`,
        subtitle: `Expires ${m.expiryDate.toLocaleDateString()}`,
        href: `/medicals/list?id=${m.id}`,
        date: m.expiryDate,
      })),
      unsignedAppointments: unsignedAppointments.map((a) => ({
        id: `apt-${a.id}`,
        type: "unsigned_appointment" as const,
        title: `${a.type} – ${a.appointee}`,
        subtitle: `Awaiting signature · ${a.status.replace(/_/g, " ")}`,
        href: `/appointments/view/${a.id}`,
        date: a.date,
      })),
      unsignedPpeIssues: unsignedPpeIssues.map((i) => ({
        id: `ppe-${i.id}`,
        type: "unsigned_ppe" as const,
        title: `${i.itemType?.name ?? "PPE"} – ${i.person?.name ?? "Unknown"}`,
        subtitle: "Awaiting signature",
        href: `/ppe-management/issue-register`,
        date: i.issueDate,
      })),
      expiringInductions: expiringInductions.map((r) => ({
        id: `ind-${r.id}`,
        type: "induction_expiring" as const,
        title: `${r.inductionType} – ${r.employee}`,
        subtitle: r.expiryDate
          ? `Expires ${r.expiryDate.toLocaleDateString()}`
          : "Expiry due",
        href: `/induction-training/list?id=${r.id}`,
        date: r.expiryDate ?? now,
      })),
      complianceReviewDue: complianceReviewDue.map((item) => ({
        id: `lc-${item.id}`,
        type: "compliance_review_due" as const,
        title: item.auditRef
          ? `${item.auditRef} – ${item.legislation}`
          : item.legislation,
        subtitle: item.nextReviewDue
          ? `Review due ${item.nextReviewDue.toLocaleDateString()}`
          : "Review overdue",
        href: `/legal-compliance/${item.id}`,
        date: item.nextReviewDue ?? now,
      })),
      contractorsLowCompliance: contractorsLowCompliance.map(({ contractor: c, compliance }) => ({
        id: `con-${c.id}`,
        type: "contractor_low_compliance" as const,
        title: c.name,
        subtitle: `${compliance.percentage}% complete (${compliance.completeCount}/${compliance.applicableCount} sections)`,
        href: `/contractors/${c.id}`,
        date: now,
      })),
      maintenanceDue,
      inspectionsDue,
      expiringPermits,
      visitorsOnSite,
      unsignedToolboxAttendees,
      hazardousChemicalsNoSds,
      plannedDrills,
      riskAssessmentsReviewDue,
      sheMeetingActionsDue,
      unsignedIncidentTeam,
      total:
        expiringCerts.length +
        expiringMedicals.length +
        unsignedAppointments.length +
        unsignedPpeIssues.length +
        expiringInductions.length +
        complianceReviewDue.length +
        contractorsLowCompliance.length +
        maintenanceDue.length +
        inspectionsDue.length +
        expiringPermits.length +
        visitorsOnSite.length +
        unsignedToolboxAttendees.length +
        hazardousChemicalsNoSds.length +
        plannedDrills.length +
        riskAssessmentsReviewDue.length +
        sheMeetingActionsDue.length +
        unsignedIncidentTeam.length,
    });
  } catch (err) {
    console.error("Notifications error:", err);
    return NextResponse.json(emptyNotifications(), { status: 200 });
  }
}
