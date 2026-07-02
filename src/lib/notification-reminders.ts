import { prisma } from "@/lib/prisma";

export type ReminderHit = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
  date: Date;
};

type Frequency = "daily" | "weekly" | "monthly";

/** Days before due date when the notification window opens. */
const NOTIFY_LEAD_DAYS: Record<Frequency, number> = {
  daily: 0,
  weekly: 2,
  monthly: 7,
};

function typeFromInspectionData(data: string, fallback: string): string {
  try {
    const parsed = JSON.parse(data) as { type?: string };
    return typeof parsed.type === "string" && parsed.type.trim()
      ? parsed.type.trim()
      : fallback;
  } catch {
    return fallback;
  }
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = startOfDay(d);
  x.setDate(x.getDate() + days);
  return x;
}

/** Next due date from the last completion (rolling schedule). */
export function nextInspectionDueDate(lastCompleted: Date, frequency: Frequency): Date {
  const last = startOfDay(lastCompleted);
  if (frequency === "daily") return addDays(last, 1);
  if (frequency === "weekly") return addDays(last, 7);
  const next = new Date(last);
  next.setMonth(next.getMonth() + 1);
  return startOfDay(next);
}

/** First calendar day the notification should appear. */
export function inspectionNotifyWindowStart(dueDate: Date, frequency: Frequency): Date {
  const due = startOfDay(dueDate);
  const lead = NOTIFY_LEAD_DAYS[frequency];
  if (lead === 0) return due;
  return addDays(due, -lead);
}

/** Whether an inspection reminder should show today based on last completion. */
export function shouldShowInspectionReminder(
  today: Date,
  lastCompleted: Date,
  frequency: Frequency
): boolean {
  const due = nextInspectionDueDate(lastCompleted, frequency);
  const windowStart = inspectionNotifyWindowStart(due, frequency);
  const t = startOfDay(today).getTime();
  // In lead window through due date, and while overdue until a new record is saved
  return t >= windowStart.getTime();
}

function frequencyLabel(frequency: Frequency): string {
  if (frequency === "daily") return "Daily";
  if (frequency === "weekly") return "Weekly";
  return "Monthly";
}

function dueSubtitle(
  frequency: Frequency,
  lastAt: Date,
  due: Date,
  now: Date
): string {
  const label = frequencyLabel(frequency);
  const today = startOfDay(now);
  const overdue = today.getTime() > due.getTime();
  if (overdue) {
    return `${label} overdue · due ${due.toLocaleDateString()} · last done ${lastAt.toLocaleDateString()}`;
  }
  if (frequency === "daily") {
    return `${label} due today · last done ${lastAt.toLocaleDateString()}`;
  }
  return `${label} due ${due.toLocaleDateString()} · last done ${lastAt.toLocaleDateString()}`;
}

async function dueInspectionsForModel(
  frequency: Frequency,
  companyId: string | undefined,
  allowedDepartments: string[] | null,
  now: Date
): Promise<ReminderHit[]> {
  const where: { companyId?: string | null; department?: string | { in: string[] } } = {};
  if (companyId) where.companyId = companyId;
  if (allowedDepartments && allowedDepartments.length > 0) {
    where.department = { in: allowedDepartments };
  }

  const fallback =
    frequency === "daily"
      ? "Daily Inspection"
      : frequency === "weekly"
        ? "Weekly Inspection"
        : "Monthly Inspection";

  const list =
    frequency === "daily"
      ? await prisma.dailyInspection.findMany({
          where,
          select: { id: true, department: true, data: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 500,
        })
      : frequency === "weekly"
        ? await prisma.weeklyInspection.findMany({
            where,
            select: { id: true, department: true, data: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 500,
          })
        : await prisma.monthlyInspection.findMany({
            where,
            select: { id: true, department: true, data: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 500,
          });

  const groups = new Map<
    string,
    { department: string; type: string; lastAt: Date; id: string }
  >();

  for (const row of list) {
    const type = typeFromInspectionData(row.data, fallback);
    const key = `${row.department}::${type}`;
    if (!groups.has(key)) {
      groups.set(key, {
        department: row.department,
        type,
        lastAt: row.createdAt,
        id: row.id,
      });
    }
  }

  const hits: ReminderHit[] = [];

  for (const g of groups.values()) {
    if (!shouldShowInspectionReminder(now, g.lastAt, frequency)) continue;

    const due = nextInspectionDueDate(g.lastAt, frequency);
    hits.push({
      id: `insp-${frequency}-${g.department}-${g.type}`.replace(/\s+/g, "-").slice(0, 80),
      type: "inspection_due",
      title: `${g.type} — ${g.department}`,
      subtitle: dueSubtitle(frequency, g.lastAt, due, now),
      href: `/inspections/new/${frequency}/${encodeURIComponent(g.type)}`,
      date: due,
    });
  }

  return hits.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function getInspectionDueReminders(options: {
  companyId?: string;
  allowedDepartments: string[] | null;
  now?: Date;
  limit?: number;
}): Promise<ReminderHit[]> {
  const now = options.now ?? new Date();
  const limit = options.limit ?? 15;

  const [daily, weekly, monthly, openNcrs] = await Promise.all([
    dueInspectionsForModel("daily", options.companyId, options.allowedDepartments, now),
    dueInspectionsForModel("weekly", options.companyId, options.allowedDepartments, now),
    dueInspectionsForModel("monthly", options.companyId, options.allowedDepartments, now),
    prisma.ncrReport.findMany({
      where: {
        status: "open",
        ...(options.companyId ? { companyId: options.companyId } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: 10,
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const ncrHits: ReminderHit[] = openNcrs.map((r) => ({
    id: `ncr-${r.id}`,
    type: "ncr_open",
    title: `Open NCR — ${r.department ?? "General"}`,
    subtitle: `${r._count.items} item${r._count.items === 1 ? "" : "s"} · opened ${r.createdAt.toLocaleDateString()}`,
    href: `/inspections/non-conformance/view/${r.id}`,
    date: r.createdAt,
  }));

  return [...daily, ...weekly, ...monthly, ...ncrHits]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit);
}

export async function getMaintenanceDueReminders(options: {
  companyId?: string;
  now?: Date;
  daysAhead?: number;
  limit?: number;
}): Promise<ReminderHit[]> {
  const now = options.now ?? new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + (options.daysAhead ?? 30));
  const limit = options.limit ?? 20;

  const schedules = await prisma.maintenanceSchedule.findMany({
    where: options.companyId ? { companyId: options.companyId } : {},
    include: {
      items: {
        include: {
          services: {
            orderBy: { serviceDate: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const hits: ReminderHit[] = [];

  for (const schedule of schedules) {
    for (const item of schedule.items) {
      const latest = item.services[0];
      if (!latest?.nextDueDate) continue;
      if (latest.nextDueDate > cutoff) continue;

      const overdue = latest.nextDueDate < startOfDay(now);
      hits.push({
        id: `maint-${item.id}`,
        type: "maintenance_due",
        title: `${item.equipmentId} — ${schedule.title}`,
        subtitle: overdue
          ? `Overdue since ${latest.nextDueDate.toLocaleDateString()}`
          : `Due ${latest.nextDueDate.toLocaleDateString()}`,
        href: `/maintenance-schedule/${schedule.id}`,
        date: latest.nextDueDate,
      });
    }
  }

  return hits.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, limit);
}

export async function getExpiringPermitReminders(options: {
  companyId?: string;
  now?: Date;
  daysAhead?: number;
  limit?: number;
}): Promise<ReminderHit[]> {
  const now = options.now ?? new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + (options.daysAhead ?? 30));
  const limit = options.limit ?? 15;

  const permits = await prisma.permitToWork.findMany({
    where: {
      endDate: { gte: now, lte: cutoff },
      status: { in: ["active", "issued", "draft"] },
      ...(options.companyId ? { companyId: options.companyId } : {}),
    },
    orderBy: { endDate: "asc" },
    take: limit,
    select: { id: true, title: true, endDate: true, permitNumber: true },
  });

  return permits.map((p) => ({
    id: `permit-${p.id}`,
    type: "permit_expiring",
    title: p.permitNumber ? `${p.permitNumber} — ${p.title}` : p.title,
    subtitle: p.endDate
      ? `Expires ${p.endDate.toLocaleDateString()}`
      : "Expiry due",
    href: `/permit-to-work/${p.id}`,
    date: p.endDate ?? now,
  }));
}

export async function getVisitorsOnSiteReminders(options: {
  companyId?: string;
  now?: Date;
  limit?: number;
}): Promise<ReminderHit[]> {
  const now = options.now ?? new Date();
  const limit = options.limit ?? 15;

  const visitors = await prisma.visitorRegisterEntry.findMany({
    where: {
      checkOutAt: null,
      ...(options.companyId ? { companyId: options.companyId } : {}),
    },
    orderBy: { checkInAt: "desc" },
    take: limit,
    select: {
      id: true,
      visitorName: true,
      hostName: true,
      checkInAt: true,
    },
  });

  return visitors.map((v) => ({
    id: `visitor-${v.id}`,
    type: "visitor_on_site",
    title: v.visitorName,
    subtitle: `Host: ${v.hostName} · checked in ${v.checkInAt.toLocaleString()}`,
    href: "/visitor-register/list",
    date: v.checkInAt,
  }));
}

export async function getUnsignedToolboxAttendeeReminders(options: {
  companyId?: string;
  now?: Date;
  limit?: number;
}): Promise<ReminderHit[]> {
  const now = options.now ?? new Date();
  const limit = options.limit ?? 15;

  const attendees = await prisma.toolboxTalkAttendee.findMany({
    where: {
      signature: null,
      talk: options.companyId ? { companyId: options.companyId } : {},
    },
    include: {
      talk: { select: { id: true, title: true, talkDate: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return attendees.map((a) => ({
    id: `tb-att-${a.id}`,
    type: "toolbox_unsigned",
    title: `${a.name}${a.surname ? ` ${a.surname}` : ""} — ${a.talk.title}`,
    subtitle: `Unsigned attendee · talk ${a.talk.talkDate.toLocaleDateString()}`,
    href: `/toolbox-talks/${a.talk.id}`,
    date: a.talk.talkDate,
  }));
}

export async function getHazardousChemicalsNoSdsReminders(options: {
  companyId?: string;
  limit?: number;
}): Promise<ReminderHit[]> {
  const now = new Date();
  const limit = options.limit ?? 15;

  const chemicals = await prisma.hazardousChemical.findMany({
    where: {
      OR: [{ sdsUrl: null }, { sdsUrl: "" }],
      ...(options.companyId ? { companyId: options.companyId } : {}),
    },
    orderBy: { name: "asc" },
    take: limit,
    select: { id: true, name: true, location: true },
  });

  return chemicals.map((c) => ({
    id: `chem-${c.id}`,
    type: "chemical_no_sds",
    title: c.name,
    subtitle: c.location
      ? `No SDS on file · ${c.location}`
      : "No SDS on file",
    href: "/hazardous-chemicals",
    date: now,
  }));
}

export async function getPlannedDrillReminders(options: {
  companyId?: string;
  now?: Date;
  daysAhead?: number;
  limit?: number;
}): Promise<ReminderHit[]> {
  const now = options.now ?? new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + (options.daysAhead ?? 30));
  const limit = options.limit ?? 15;

  const drills = await prisma.emergencyDrill.findMany({
    where: {
      status: "planned",
      drillDate: { lte: cutoff },
      ...(options.companyId ? { companyId: options.companyId } : {}),
    },
    orderBy: { drillDate: "asc" },
    take: limit,
    select: { id: true, title: true, drillDate: true, location: true },
  });

  return drills.map((d) => {
    const overdue = startOfDay(d.drillDate).getTime() < startOfDay(now).getTime();
    return {
      id: `drill-${d.id}`,
      type: "drill_planned",
      title: d.title,
      subtitle: overdue
        ? `Planned drill overdue · ${d.drillDate.toLocaleDateString()}`
        : `Planned for ${d.drillDate.toLocaleDateString()}${d.location ? ` · ${d.location}` : ""}`,
      href: `/emergency-drills/${d.id}`,
      date: d.drillDate,
    };
  });
}

export async function getRiskAssessmentReviewReminders(options: {
  companyId?: string;
  now?: Date;
  daysAhead?: number;
  limit?: number;
}): Promise<ReminderHit[]> {
  const now = options.now ?? new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + (options.daysAhead ?? 30));
  const limit = options.limit ?? 15;

  const assessments = await prisma.riskAssessment.findMany({
    where: {
      reviewDate: { lte: cutoff },
      ...(options.companyId ? { companyId: options.companyId } : {}),
    },
    orderBy: { reviewDate: "asc" },
    take: limit,
    select: { id: true, title: true, reviewDate: true, riskLevel: true },
  });

  return assessments.map((r) => ({
    id: `ra-${r.id}`,
    type: "risk_review_due",
    title: r.title,
    subtitle: r.reviewDate
      ? `Review due ${r.reviewDate.toLocaleDateString()} · ${r.riskLevel} risk`
      : `Review due · ${r.riskLevel} risk`,
    href: `/risk-assessments/${r.id}`,
    date: r.reviewDate ?? now,
  }));
}

type SheActionItem = {
  description?: string;
  assignee?: string;
  dueDate?: string;
  done?: boolean;
};

export async function getSheMeetingActionReminders(options: {
  companyId?: string;
  now?: Date;
  daysAhead?: number;
  limit?: number;
}): Promise<ReminderHit[]> {
  const now = options.now ?? new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + (options.daysAhead ?? 30));
  const limit = options.limit ?? 15;

  const meetings = await prisma.sHECommitteeMeeting.findMany({
    where: options.companyId ? { companyId: options.companyId } : {},
    orderBy: { date: "desc" },
    take: 50,
    select: { id: true, date: true, actionItems: true },
  });

  const hits: ReminderHit[] = [];

  for (const meeting of meetings) {
    if (!meeting.actionItems?.trim()) continue;
    let items: SheActionItem[] = [];
    try {
      const parsed = JSON.parse(meeting.actionItems) as unknown;
      items = Array.isArray(parsed) ? (parsed as SheActionItem[]) : [];
    } catch {
      continue;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.done) continue;
      if (!item.dueDate) continue;
      const due = new Date(item.dueDate);
      if (Number.isNaN(due.getTime()) || due > cutoff) continue;

      hits.push({
        id: `she-${meeting.id}-${i}`,
        type: "she_action_due",
        title: item.description?.slice(0, 120) || "Action item",
        subtitle: item.assignee
          ? `Assignee: ${item.assignee} · due ${due.toLocaleDateString()}`
          : `Due ${due.toLocaleDateString()}`,
        href: `/she-committee/meetings/${meeting.id}`,
        date: due,
      });
    }
  }

  return hits.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, limit);
}

/** Investigation team members who have not signed on open incidents. */
export async function getUnsignedIncidentTeamReminders(opts: {
  companyId?: string;
  limit?: number;
}): Promise<ReminderHit[]> {
  const { companyId, limit = 20 } = opts;

  const members = await prisma.investigationTeamMember.findMany({
    where: {
      signature: null,
      incident: {
        status: { notIn: ["completed", "signed"] },
        ...(companyId && { companyId }),
      },
    },
    include: {
      incident: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return members.map((m) => ({
    id: `inc-team-${m.id}`,
    type: "unsigned_incident_team",
    title: `${m.name} — ${m.incident.title}`,
    subtitle: `${m.designation} · awaiting signature`,
    href: `/incidents/${m.incidentId}`,
    date: m.createdAt,
  }));
}
