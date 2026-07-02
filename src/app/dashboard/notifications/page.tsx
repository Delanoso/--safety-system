"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileWarning,
  Stethoscope,
  FileSignature,
  Package,
  ArrowLeft,
  ClipboardList,
  HardHat,
  Users,
  Wrench,
  Search,
  Calendar,
  FlaskConical,
  AlertTriangle,
  Shield,
} from "lucide-react";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  href: string;
  date: string | Date;
};

type NotificationData = {
  expiringCertificates: NotificationItem[];
  expiringMedicals: NotificationItem[];
  unsignedAppointments: NotificationItem[];
  unsignedPpeIssues: NotificationItem[];
  expiringInductions: NotificationItem[];
  complianceReviewDue: NotificationItem[];
  contractorsLowCompliance: NotificationItem[];
  maintenanceDue: NotificationItem[];
  inspectionsDue: NotificationItem[];
  expiringPermits: NotificationItem[];
  visitorsOnSite: NotificationItem[];
  unsignedToolboxAttendees: NotificationItem[];
  hazardousChemicalsNoSds: NotificationItem[];
  plannedDrills: NotificationItem[];
  riskAssessmentsReviewDue: NotificationItem[];
  sheMeetingActionsDue: NotificationItem[];
  unsignedIncidentTeam: NotificationItem[];
  total: number;
};

const typeIcons: Record<string, React.ReactNode> = {
  certificate_expiring: <FileWarning size={20} />,
  medical_expiring: <Stethoscope size={20} />,
  unsigned_appointment: <FileSignature size={20} />,
  unsigned_ppe: <Package size={20} />,
  induction_expiring: <Users size={20} />,
  compliance_review_due: <ClipboardList size={20} />,
  contractor_low_compliance: <HardHat size={20} />,
  maintenance_due: <Wrench size={20} />,
  inspection_due: <Search size={20} />,
  ncr_open: <ClipboardList size={20} />,
  permit_expiring: <Calendar size={20} />,
  visitor_on_site: <Users size={20} />,
  toolbox_unsigned: <HardHat size={20} />,
  chemical_no_sds: <FlaskConical size={20} />,
  drill_planned: <AlertTriangle size={20} />,
  risk_review_due: <Shield size={20} />,
  she_action_due: <ClipboardList size={20} />,
  unsigned_incident_team: <FileSignature size={20} />,
};

const typeLabels: Record<string, string> = {
  certificate_expiring: "Certificate expiring",
  medical_expiring: "Medical expiring",
  unsigned_appointment: "Awaiting signature",
  unsigned_ppe: "PPE awaiting signature",
  induction_expiring: "Induction expiring",
  compliance_review_due: "Compliance review due",
  contractor_low_compliance: "Contractor compliance low",
  maintenance_due: "Maintenance due",
  inspection_due: "Inspection due",
  ncr_open: "Open non-conformance",
  permit_expiring: "Permit expiring",
  visitor_on_site: "Visitor on site",
  toolbox_unsigned: "Toolbox talk unsigned",
  chemical_no_sds: "Chemical missing SDS",
  drill_planned: "Planned emergency drill",
  risk_review_due: "Risk assessment review due",
  she_action_due: "SHE meeting action due",
  unsigned_incident_team: "Incident team unsigned",
};

function NotificationCard({ item }: { item: NotificationItem }) {
  const icon = typeIcons[item.type] ?? <FileWarning size={20} />;
  const label = typeLabels[item.type] ?? item.type;

  return (
    <Link
      href={item.href}
      className="flex gap-4 p-4 rounded-xl border border-[var(--foreground)]/10
                 bg-[var(--card-bg)] hover:bg-[var(--card-bg)]/80
                 transition group"
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                   bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--foreground)] truncate group-hover:underline">
          {item.title}
        </p>
        <p className="text-sm text-[var(--muted-foreground)]">{item.subtitle}</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1 opacity-80">
          {label}
        </p>
      </div>
    </Link>
  );
}

export default function NotificationsPage() {
  const [data, setData] = useState<NotificationData | null>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const allItems: NotificationItem[] = data
    ? [
        ...data.expiringCertificates,
        ...data.expiringMedicals,
        ...data.unsignedAppointments,
        ...data.unsignedPpeIssues,
        ...(data.expiringInductions ?? []),
        ...(data.complianceReviewDue ?? []),
        ...(data.contractorsLowCompliance ?? []),
        ...(data.maintenanceDue ?? []),
        ...(data.inspectionsDue ?? []),
        ...(data.expiringPermits ?? []),
        ...(data.visitorsOnSite ?? []),
        ...(data.unsignedToolboxAttendees ?? []),
        ...(data.hazardousChemicalsNoSds ?? []),
        ...(data.plannedDrills ?? []),
        ...(data.riskAssessmentsReviewDue ?? []),
        ...(data.sheMeetingActionsDue ?? []),
        ...(data.unsignedIncidentTeam ?? []),
      ].sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    : [];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-[var(--foreground)]/10 transition"
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Notifications
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Expiring certificates, medicals and inductions, inspections and maintenance due, compliance reviews, and documents awaiting signature
          </p>
        </div>
      </div>

      {data === null ? (
        <p className="text-[var(--muted-foreground)]">Loading…</p>
      ) : allItems.length === 0 ? (
        <div
          className="p-8 rounded-2xl border border-[var(--foreground)]/10
                     bg-[var(--card-bg)] text-center text-[var(--muted-foreground)]"
        >
          <p className="font-medium">No notifications</p>
          <p className="text-sm mt-1">
            All certificates and medicals are up to date, and there are no
            documents awaiting signature.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.expiringCertificates.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileWarning size={18} />
                Certificates expiring in 30 days
              </h2>
              <div className="space-y-2">
                {data.expiringCertificates.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {data.expiringMedicals.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Stethoscope size={18} />
                Medicals expiring in 30 days
              </h2>
              <div className="space-y-2">
                {data.expiringMedicals.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {data.unsignedAppointments.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileSignature size={18} />
                Appointments awaiting signature
              </h2>
              <div className="space-y-2">
                {data.unsignedAppointments.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.unsignedIncidentTeam?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileSignature size={18} />
                Incident investigation teams awaiting signature
              </h2>
              <div className="space-y-2">
                {data.unsignedIncidentTeam.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {data.unsignedPpeIssues.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Package size={18} />
                PPE issues awaiting signature
              </h2>
              <div className="space-y-2">
                {data.unsignedPpeIssues.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.expiringInductions?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users size={18} />
                Inductions expiring in 30 days
              </h2>
              <div className="space-y-2">
                {data.expiringInductions.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.complianceReviewDue?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ClipboardList size={18} />
                Legal compliance reviews due
              </h2>
              <div className="space-y-2">
                {data.complianceReviewDue.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.inspectionsDue?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Search size={18} />
                Inspections due & open NCRs
              </h2>
              <div className="space-y-2">
                {data.inspectionsDue.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.maintenanceDue?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Wrench size={18} />
                Maintenance due (30 days)
              </h2>
              <div className="space-y-2">
                {data.maintenanceDue.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.contractorsLowCompliance?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <HardHat size={18} />
                Contractors below 80% compliance
              </h2>
              <div className="space-y-2">
                {data.contractorsLowCompliance.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.expiringPermits?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calendar size={18} />
                Permits expiring in 30 days
              </h2>
              <div className="space-y-2">
                {data.expiringPermits.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.visitorsOnSite?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users size={18} />
                Visitors currently on site
              </h2>
              <div className="space-y-2">
                {data.visitorsOnSite.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.unsignedToolboxAttendees?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <HardHat size={18} />
                Toolbox talk attendees awaiting signature
              </h2>
              <div className="space-y-2">
                {data.unsignedToolboxAttendees.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.hazardousChemicalsNoSds?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FlaskConical size={18} />
                Chemicals without SDS
              </h2>
              <div className="space-y-2">
                {data.hazardousChemicalsNoSds.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.plannedDrills?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                Planned emergency drills
              </h2>
              <div className="space-y-2">
                {data.plannedDrills.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.riskAssessmentsReviewDue?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield size={18} />
                Risk assessment reviews due
              </h2>
              <div className="space-y-2">
                {data.riskAssessmentsReviewDue.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
          {(data.sheMeetingActionsDue?.length ?? 0) > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <ClipboardList size={18} />
                SHE meeting actions due
              </h2>
              <div className="space-y-2">
                {data.sheMeetingActionsDue.map((item) => (
                  <NotificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
