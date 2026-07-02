import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { MODULES, filterByModuleAccess } from "@/lib/module-access";
import { drillTypeLabel } from "@/lib/emergency-drills";
import { permitTypeLabel } from "@/lib/site-safety";
import { computeContractorCompliance } from "@/lib/contractor-compliance";
import { incidentTypeLabel } from "@/lib/incident-constants";

export const dynamic = "force-dynamic";

export type SearchHit = {
  category: string;
  title: string;
  subtitle?: string;
  href: string;
};

const TAKE = 8;

function companyFilter(companyId: string | null | undefined, role: string) {
  if (role === "super" || !companyId) return {};
  return { companyId };
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) {
      return NextResponse.json({ query: q, results: [] });
    }

    const cf = companyFilter(user.companyId, user.role);
    const term = q;
    const results: SearchHit[] = [];

    const [
      incidents,
      medicals,
      certificates,
      contractors,
      people,
      compliance,
      toolboxTalks,
      inductions,
      visitors,
      permits,
      drills,
      riskAssessments,
      appointments,
      dailyInspections,
      weeklyInspections,
      monthlyInspections,
      maintenanceSchedules,
      ppePersons,
      ppeItemTypes,
      hazardousChemicals,
      ncrReports,
      sheMeetings,
      uploadedFiles,
      companyDocuments,
      companyDivisions,
    ] = await Promise.all([
      prisma.incident.findMany({
        where: {
          ...cf,
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { employee: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { department: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { date: "desc" },
        select: { id: true, title: true, employee: true, date: true, type: true },
      }),
      prisma.medical.findMany({
        where: {
          ...cf,
          OR: [
            { employee: { contains: term, mode: "insensitive" } },
            { medicalType: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { issueDate: "desc" },
        select: { id: true, employee: true, medicalType: true },
      }),
      prisma.certificate.findMany({
        where: {
          ...cf,
          OR: [
            { employee: { contains: term, mode: "insensitive" } },
            { certificateName: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { issueDate: "desc" },
        select: { id: true, employee: true, certificateName: true },
      }),
      prisma.contractor.findMany({
        where: {
          ...cf,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { contactEmail: { contains: term, mode: "insensitive" } },
            { jobDescription: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, documents: { select: { section: true } }, excludedSections: true },
      }),
      user.companyId
        ? prisma.companyPerson.findMany({
            where: {
              companyId: user.companyId,
              OR: [
                { name: { contains: term, mode: "insensitive" } },
                { surname: { contains: term, mode: "insensitive" } },
                { employeeNumber: { contains: term, mode: "insensitive" } },
                { idNumber: { contains: term, mode: "insensitive" } },
              ],
            },
            take: TAKE,
            select: { id: true, name: true, surname: true, employeeNumber: true },
          })
        : Promise.resolve([]),
      prisma.legalComplianceItem.findMany({
        where: {
          ...cf,
          OR: [
            { requirement: { contains: term, mode: "insensitive" } },
            { legislation: { contains: term, mode: "insensitive" } },
            { auditRef: { contains: term, mode: "insensitive" } },
            { section: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        select: { id: true, requirement: true, auditRef: true },
      }),
      prisma.toolboxTalk.findMany({
        where: {
          ...cf,
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { topic: { contains: term, mode: "insensitive" } },
            { presenter: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { talkDate: "desc" },
        select: { id: true, title: true, talkDate: true },
      }),
      prisma.inductionTraining.findMany({
        where: {
          ...cf,
          OR: [
            { employee: { contains: term, mode: "insensitive" } },
            { inductionType: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { issueDate: "desc" },
        select: { id: true, employee: true, inductionType: true },
      }),
      prisma.visitorRegisterEntry.findMany({
        where: {
          ...cf,
          OR: [
            { visitorName: { contains: term, mode: "insensitive" } },
            { hostName: { contains: term, mode: "insensitive" } },
            { visitorCompany: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { checkInAt: "desc" },
        select: { id: true, visitorName: true, hostName: true, checkInAt: true },
      }),
      prisma.permitToWork.findMany({
        where: {
          ...cf,
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { permitNumber: { contains: term, mode: "insensitive" } },
            { location: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { startDate: "desc" },
        select: { id: true, title: true, permitType: true, permitNumber: true },
      }),
      prisma.emergencyDrill.findMany({
        where: {
          ...cf,
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { coordinator: { contains: term, mode: "insensitive" } },
            { location: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { drillDate: "desc" },
        select: { id: true, title: true, drillType: true, drillDate: true },
      }),
      prisma.riskAssessment.findMany({
        where: {
          ...cf,
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { department: { contains: term, mode: "insensitive" } },
            { location: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, riskLevel: true },
      }),
      prisma.appointment.findMany({
        where: {
          ...cf,
          OR: [
            { type: { contains: term, mode: "insensitive" } },
            { appointee: { contains: term, mode: "insensitive" } },
            { appointer: { contains: term, mode: "insensitive" } },
            { department: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { date: "desc" },
        select: { id: true, type: true, appointee: true, date: true },
      }),
      prisma.dailyInspection.findMany({
        where: {
          ...cf,
          OR: [
            { department: { contains: term, mode: "insensitive" } },
            { inspector: { contains: term, mode: "insensitive" } },
            { inspectionType: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { createdAt: "desc" },
        select: { id: true, department: true, inspectionType: true, createdAt: true },
      }),
      prisma.weeklyInspection.findMany({
        where: {
          ...cf,
          OR: [
            { department: { contains: term, mode: "insensitive" } },
            { inspector: { contains: term, mode: "insensitive" } },
            { inspectionType: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { createdAt: "desc" },
        select: { id: true, department: true, inspectionType: true, createdAt: true },
      }),
      prisma.monthlyInspection.findMany({
        where: {
          ...cf,
          OR: [
            { department: { contains: term, mode: "insensitive" } },
            { inspector: { contains: term, mode: "insensitive" } },
            { inspectionType: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { createdAt: "desc" },
        select: { id: true, department: true, inspectionType: true, createdAt: true },
      }),
      prisma.maintenanceSchedule.findMany({
        where: {
          ...cf,
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { type: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, type: true },
      }),
      user.companyId
        ? prisma.pPEPerson.findMany({
            where: {
              subDepartmentRelation: {
                department: { companyId: user.companyId },
              },
              name: { contains: term, mode: "insensitive" },
            },
            take: TAKE,
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      user.companyId
        ? prisma.pPEItemType.findMany({
            where: {
              companyId: user.companyId,
              name: { contains: term, mode: "insensitive" },
            },
            take: TAKE,
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
      prisma.hazardousChemical.findMany({
        where: {
          ...cf,
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { casNumber: { contains: term, mode: "insensitive" } },
            { location: { contains: term, mode: "insensitive" } },
            { hazardClass: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { name: "asc" },
        select: { id: true, name: true, casNumber: true, location: true },
      }),
      prisma.ncrReport.findMany({
        where: {
          ...cf,
          OR: [
            { department: { contains: term, mode: "insensitive" } },
            { status: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { createdAt: "desc" },
        select: { id: true, department: true, status: true, createdAt: true },
      }),
      prisma.sHECommitteeMeeting.findMany({
        where: {
          ...cf,
          OR: [
            { agenda: { contains: term, mode: "insensitive" } },
            { minutes: { contains: term, mode: "insensitive" } },
          ],
        },
        take: TAKE,
        orderBy: { date: "desc" },
        select: { id: true, date: true, agenda: true },
      }),
      prisma.file.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { folder: { name: { contains: term, mode: "insensitive" } } },
            { folder: { section: { contains: term, mode: "insensitive" } } },
          ],
        },
        take: TAKE,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          folder: { select: { section: true, name: true } },
        },
      }),
      user.companyId
        ? prisma.companyDocument.findMany({
            where: {
              division: { companyId: user.companyId },
              name: { contains: term, mode: "insensitive" },
            },
            take: TAKE,
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, division: { select: { name: true } } },
          })
        : Promise.resolve([]),
      user.companyId
        ? prisma.companyDocumentDivision.findMany({
            where: {
              companyId: user.companyId,
              name: { contains: term, mode: "insensitive" },
            },
            take: TAKE,
            select: { id: true, name: true },
          })
        : Promise.resolve([]),
    ]);

    for (const i of incidents) {
      results.push({
        category: "Incidents",
        title: i.title,
        subtitle: [incidentTypeLabel(i.type ?? ""), i.employee].filter(Boolean).join(" · ") || undefined,
        href: `/incidents/view/${i.id}`,
      });
    }
    for (const m of medicals) {
      results.push({
        category: "Medicals",
        title: `${m.employee} — ${m.medicalType}`,
        href: `/medicals/list?id=${m.id}`,
      });
    }
    for (const c of certificates) {
      results.push({
        category: "Training",
        title: `${c.employee} — ${c.certificateName}`,
        href: `/training/certificates/list?id=${c.id}`,
      });
    }
    for (const c of contractors) {
      const comp = computeContractorCompliance(c.documents, c.excludedSections);
      results.push({
        category: "Contractors",
        title: c.name,
        subtitle: `Safety file ${comp.percentage}% complete`,
        href: `/contractors/${c.id}`,
      });
    }
    for (const p of people) {
      results.push({
        category: "Staff Members",
        title: [p.name, p.surname].filter(Boolean).join(" "),
        subtitle: p.employeeNumber ? `#${p.employeeNumber}` : undefined,
        href: `/users#staff-members`,
      });
    }
    for (const item of compliance) {
      results.push({
        category: "Legal Compliance",
        title: item.requirement.slice(0, 120),
        subtitle: item.auditRef ?? undefined,
        href: `/legal-compliance/${item.id}`,
      });
    }
    for (const t of toolboxTalks) {
      results.push({
        category: "Toolbox Talks",
        title: t.title,
        subtitle: new Date(t.talkDate).toLocaleDateString(),
        href: `/toolbox-talks/${t.id}`,
      });
    }
    for (const ind of inductions) {
      results.push({
        category: "Induction Training",
        title: `${ind.employee} — ${ind.inductionType}`,
        href: `/induction-training/list?id=${ind.id}`,
      });
    }
    for (const v of visitors) {
      results.push({
        category: "Visitor Register",
        title: v.visitorName,
        subtitle: `Host: ${v.hostName}`,
        href: `/visitor-register/list?id=${v.id}`,
      });
    }
    for (const p of permits) {
      results.push({
        category: "Permit to Work",
        title: p.title,
        subtitle: permitTypeLabel(p.permitType),
        href: `/permit-to-work/${p.id}`,
      });
    }
    for (const d of drills) {
      results.push({
        category: "Emergency Drills",
        title: d.title,
        subtitle: drillTypeLabel(d.drillType),
        href: `/emergency-drills/${d.id}`,
      });
    }
    for (const r of riskAssessments) {
      results.push({
        category: "Risk Assessments",
        title: r.title,
        subtitle: r.riskLevel,
        href: `/risk-assessments/${r.id}`,
      });
    }
    for (const a of appointments) {
      results.push({
        category: "Appointments",
        title: `${a.type} — ${a.appointee}`,
        href: `/appointments/view/${a.id}`,
      });
    }
    for (const i of dailyInspections) {
      results.push({
        category: "Inspections",
        title: i.inspectionType || i.department,
        subtitle: `Daily · ${i.department}`,
        href: `/inspections/view/daily/${i.id}`,
      });
    }
    for (const i of weeklyInspections) {
      results.push({
        category: "Inspections",
        title: i.inspectionType || i.department,
        subtitle: `Weekly · ${i.department}`,
        href: `/inspections/view/weekly/${i.id}`,
      });
    }
    for (const i of monthlyInspections) {
      results.push({
        category: "Inspections",
        title: i.inspectionType || i.department,
        subtitle: `Monthly · ${i.department}`,
        href: `/inspections/view/monthly/${i.id}`,
      });
    }
    for (const s of maintenanceSchedules) {
      results.push({
        category: "Maintenance",
        title: s.title,
        subtitle: s.type.replace(/_/g, " "),
        href: `/maintenance-schedule/${s.id}`,
      });
    }
    for (const p of ppePersons) {
      results.push({
        category: "PPE",
        title: p.name,
        subtitle: "Person",
        href: "/ppe-management/size-list",
      });
    }
    for (const t of ppeItemTypes) {
      results.push({
        category: "PPE",
        title: t.name,
        subtitle: "Item type",
        href: "/ppe-management/stock-list",
      });
    }
    for (const c of hazardousChemicals) {
      results.push({
        category: "Hazardous Chemicals",
        title: c.name,
        subtitle: [c.casNumber, c.location].filter(Boolean).join(" · ") || undefined,
        href: `/hazardous-chemicals?id=${c.id}`,
      });
    }
    for (const n of ncrReports) {
      results.push({
        category: "Non-Conformance",
        title: n.department ? `NCR — ${n.department}` : "NCR Report",
        subtitle: n.status,
        href: `/inspections/non-conformance/view/${n.id}`,
      });
    }
    for (const m of sheMeetings) {
      results.push({
        category: "SHE Meetings",
        title: m.agenda?.slice(0, 80) || `Meeting ${new Date(m.date).toLocaleDateString()}`,
        subtitle: new Date(m.date).toLocaleDateString(),
        href: `/she-committee/meetings/${m.id}`,
      });
    }
    for (const f of uploadedFiles) {
      results.push({
        category: "Uploaded Documents",
        title: f.name,
        subtitle: `${f.folder.section} / ${f.folder.name}`,
        href: `/docs/${f.folder.section}`,
      });
    }
    for (const d of companyDocuments) {
      results.push({
        category: "Company Documents",
        title: d.name,
        subtitle: d.division.name,
        href: "/docs/company-documents",
      });
    }
    for (const d of companyDivisions) {
      results.push({
        category: "Company Documents",
        title: d.name,
        subtitle: "Division",
        href: "/docs/company-documents",
      });
    }

  const qLower = q.toLowerCase();
  for (const mod of MODULES) {
    if (
      mod.label.toLowerCase().includes(qLower) ||
      mod.slug.includes(qLower)
    ) {
      const href =
        mod.slug === "inspections"
          ? "/inspections/select-department"
          : mod.slug === "dashboard"
            ? "/dashboard"
            : mod.slug === "notifications"
              ? "/dashboard/notifications"
              : mod.slug === "docs"
                ? "/docs/working-procedures"
                : `/${mod.slug}`;
      if (!results.some((r) => r.href === href && r.category === "Modules")) {
        results.push({ category: "Modules", title: mod.label, href });
      }
    }
  }

    return NextResponse.json({
      query: q,
      results: filterByModuleAccess(results, user.allowedModules),
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed", results: [] }, { status: 500 });
  }
}
