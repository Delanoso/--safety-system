"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileWarning,
  Stethoscope,
  FileSignature,
  Package,
  ArrowLeft,
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
  total: number;
};

const typeIcons: Record<string, React.ReactNode> = {
  certificate_expiring: <FileWarning size={20} />,
  medical_expiring: <Stethoscope size={20} />,
  unsigned_appointment: <FileSignature size={20} />,
  unsigned_ppe: <Package size={20} />,
};

const typeLabels: Record<string, string> = {
  certificate_expiring: "Certificate expiring",
  medical_expiring: "Medical expiring",
  unsigned_appointment: "Awaiting signature",
  unsigned_ppe: "PPE awaiting signature",
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
            Expiring certificates and medicals (30 days), documents awaiting
            signature
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
        </div>
      )}
    </div>
  );
}
