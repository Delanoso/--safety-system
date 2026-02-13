import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DAYS_AHEAD = 30;

export async function GET() {
  try {
    const user = await getCurrentUser();
    const dbUser = user ? await prisma.user.findUnique({
      where: { id: user.id },
      select: { notificationsEnabled: true },
    }) : null;
    const notificationsEnabled = dbUser?.notificationsEnabled ?? true;
    if (!notificationsEnabled) {
      return NextResponse.json({
        expiringCertificates: [],
        expiringMedicals: [],
        unsignedAppointments: [],
        unsignedPpeIssues: [],
        total: 0,
      });
    }
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + DAYS_AHEAD);

    // Certificates expiring in 30 days
    const expiringCerts = await prisma.certificate.findMany({
      where: {
        expiryDate: { gte: now, lte: cutoff },
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

    // PPE issues pending signature
    const unsignedPpeIssues = await prisma.pPEIssue.findMany({
      where: { status: "pending_signature" },
      include: {
        person: { select: { name: true } },
        itemType: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      expiringCertificates: expiringCerts.map((c) => ({
        id: `cert-${c.id}`,
        type: "certificate_expiring" as const,
        title: `${c.certificateName} – ${c.employee}`,
        subtitle: `Expires ${c.expiryDate.toLocaleDateString()}`,
        href: "/training/certificates/list",
        date: c.expiryDate,
      })),
      expiringMedicals: expiringMedicals.map((m) => ({
        id: `med-${m.id}`,
        type: "medical_expiring" as const,
        title: `${m.medicalType} – ${m.employee}`,
        subtitle: `Expires ${m.expiryDate.toLocaleDateString()}`,
        href: "/medicals/list",
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
      total:
        expiringCerts.length +
        expiringMedicals.length +
        unsignedAppointments.length +
        unsignedPpeIssues.length,
    });
  } catch (err) {
    console.error("Notifications error:", err);
    return NextResponse.json(
      {
        expiringCertificates: [],
        expiringMedicals: [],
        unsignedAppointments: [],
        unsignedPpeIssues: [],
        total: 0,
      },
      { status: 200 }
    );
  }
}
