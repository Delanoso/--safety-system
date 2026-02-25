import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PdfDocument, PdfImageBw, PdfSection, PdfSignatureBlock, pdfTableStyles } from "@/components/pdf/PdfDocument";
import { getCompanyLogoUrl } from "@/lib/pdf";
import appointmentTemplates from "@/app/appointments/templates";

const bodyTextStyle: React.CSSProperties = { color: "#111827", fontSize: 14, lineHeight: 1.6 };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/** Sanitize for use in filename (remove / \ : * ? " < > |). */
function sanitizeForFilename(s: string): string {
  return s.replace(/[/\\:*?"<>|]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || "document";
}

/** Get document title for page title / default PDF filename. */
async function getPdfDocumentTitle(type: string, id: string): Promise<string> {
  try {
    switch (type) {
      case "appointment": {
        const a = await prisma.appointment.findUnique({ where: { id }, select: { type: true, appointee: true, date: true } });
        if (!a) return `Appointment ${id}`;
        const dateStr = new Date(a.date).toISOString().slice(0, 10);
        return `Appointment ${sanitizeForFilename(a.type)} - ${sanitizeForFilename(a.appointee)} ${dateStr}`;
      }
      case "incident": {
        const i = await prisma.incident.findUnique({ where: { id }, select: { title: true } });
        if (!i) return `Incident ${id}`;
        return `Incident Report - ${sanitizeForFilename(i.title)}`;
      }
      case "daily-inspection": {
        const d = await prisma.dailyInspection.findUnique({ where: { id }, select: { department: true, createdAt: true } });
        if (!d) return `Daily Inspection ${id}`;
        const dateStr = new Date(d.createdAt).toISOString().slice(0, 10);
        return `Daily Inspection ${sanitizeForFilename(d.department)} ${dateStr}`;
      }
      case "weekly-inspection": {
        const w = await prisma.weeklyInspection.findUnique({ where: { id }, select: { department: true, createdAt: true } });
        if (!w) return `Weekly Inspection ${id}`;
        const dateStr = new Date(w.createdAt).toISOString().slice(0, 10);
        return `Weekly Inspection ${sanitizeForFilename(w.department)} ${dateStr}`;
      }
      case "monthly-inspection": {
        const m = await prisma.monthlyInspection.findUnique({ where: { id }, select: { department: true, createdAt: true } });
        if (!m) return `Monthly Inspection ${id}`;
        const dateStr = new Date(m.createdAt).toISOString().slice(0, 10);
        return `Monthly Inspection ${sanitizeForFilename(m.department)} ${dateStr}`;
      }
      case "ncr": {
        const n = await prisma.ncrReport.findUnique({ where: { id }, select: { createdAt: true } });
        if (!n) return `NCR Report ${id}`;
        const dateStr = new Date(n.createdAt).toISOString().slice(0, 10);
        return `NCR Report ${dateStr}`;
      }
      case "training-certificate": {
        const numId = Number(id);
        if (!Number.isInteger(numId)) return `Certificate ${id}`;
        const c = await prisma.certificate.findUnique({ where: { id: numId }, select: { employee: true, certificateName: true } });
        if (!c) return `Certificate ${id}`;
        return `Certificate ${sanitizeForFilename(c.employee)} - ${sanitizeForFilename(c.certificateName)}`;
      }
      case "medical-certificate": {
        const numId = Number(id);
        if (!Number.isInteger(numId)) return `Medical ${id}`;
        const m = await prisma.medical.findUnique({ where: { id: numId }, select: { employee: true, medicalType: true } });
        if (!m) return `Medical ${id}`;
        return `Medical ${sanitizeForFilename(m.employee)} - ${sanitizeForFilename(m.medicalType)}`;
      }
      case "risk-assessment": {
        const r = await prisma.riskAssessment.findUnique({ where: { id }, select: { title: true } });
        if (!r) return `Risk Assessment ${id}`;
        return `Risk Assessment - ${sanitizeForFilename(r.title)}`;
      }
      default:
        return `${type} ${id}`;
    }
  } catch {
    return `${type} ${id}`;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const type = typeof params.type === "string" ? params.type : "";
  const id = typeof params.id === "string" ? params.id : "";
  if (!type || !id) return { title: "Document" };
  const title = await getPdfDocumentTitle(type, id);
  return { title };
}

export default async function PdfRendererPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const type = typeof params.type === "string" ? params.type : "";
  const id = typeof params.id === "string" ? params.id : "";

  if (!type || !id) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
        <h1>Missing parameters</h1>
        <p>Expected query params: type and id.</p>
      </div>
    );
  }

  switch (type) {
    case "daily-inspection":
      return <DailyInspectionTemplate id={id} />;
    case "weekly-inspection":
      return <WeeklyInspectionTemplate id={id} />;
    case "monthly-inspection":
      return <MonthlyInspectionTemplate id={id} />;
    case "appointment":
      return <AppointmentTemplate id={id} />;
    case "incident":
      return <IncidentTemplate id={id} />;
    case "ncr":
      return <NcrTemplate id={id} />;
    case "training-certificate":
      return <CertificateTemplate id={id} />;
    case "medical-certificate":
      return <MedicalTemplate id={id} />;
    case "risk-assessment":
      return <RiskAssessmentTemplate id={id} />;

    default:
      return (
        <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
          <h1>Unknown PDF type</h1>
          <p>Type: {type}</p>
        </div>
      );
  }
}

async function DailyInspectionTemplate({ id }: { id: string }) {
  const inspection = await prisma.dailyInspection.findUnique({
    where: { id },
    select: { id: true, department: true, inspector: true, createdAt: true, data: true, companyId: true },
  });

  if (!inspection) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
        <h1>Inspection not found</h1>
        <p>No inspection exists for ID: {id}</p>
      </div>
    );
  }

  let parsed: {
    columns: string[];
    legendItems: string[];
    rows: string[][];
  } = {
    columns: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    legendItems: [],
    rows: [],
  };

  try {
    parsed = {
      ...parsed,
      ...(inspection.data ? JSON.parse(inspection.data as string) : {}),
    };
  } catch {
    // ignore parse errors
  }

  const { columns, legendItems, rows } = parsed;
  const logoUrl = await getCompanyLogoUrl();

  return (
    <PdfDocument
      title="Daily Inspection Report"
      documentType="Safety System — Daily Inspection Report"
      logoUrl={logoUrl}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Inspection ID:</strong> {id}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Department:</strong> {inspection.department}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Inspector:</strong> {inspection.inspector}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Created At:</strong>{" "}
          {new Date(inspection.createdAt).toLocaleString()}
        </div>
      </div>

      <table style={pdfTableStyles.table}>
        <thead>
          <tr>
            <th style={pdfTableStyles.th}>#</th>
            <th style={pdfTableStyles.th}>Inspection Item</th>
            {columns.map((col) => (
              <th key={col} style={pdfTableStyles.th}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {legendItems.map((item, rowIndex) => (
            <tr key={rowIndex}>
              <td style={pdfTableStyles.td}>{rowIndex + 1}</td>
              <td style={pdfTableStyles.td}>{item}</td>
              {columns.map((_, colIndex) => (
                <td key={colIndex} style={pdfTableStyles.td}>
                  {rows?.[rowIndex]?.[colIndex] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </PdfDocument>
  );
}

type WeeklyMonthlyRow = { id?: string; description?: string; location?: string; weeks?: string[]; months?: string[] };

async function WeeklyInspectionTemplate({ id }: { id: string }) {
  const inspection = await prisma.weeklyInspection.findUnique({
    where: { id },
    select: { id: true, department: true, inspector: true, createdAt: true, data: true, companyId: true },
  });

  if (!inspection) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
        <h1>Inspection not found</h1>
        <p>No weekly inspection exists for ID: {id}</p>
      </div>
    );
  }

  const defaultColumns = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
  let columns = defaultColumns;
  let rows: WeeklyMonthlyRow[] = [];

  try {
    if (inspection.data) {
      const raw = JSON.parse(inspection.data as string);
      columns = raw.columns ?? defaultColumns;
      rows = Array.isArray(raw.rows) ? raw.rows : [];
    }
  } catch {
    // keep defaults
  }

  const logoUrl = await getCompanyLogoUrl();

  return (
    <PdfDocument
      title="Weekly Inspection Report"
      documentType="Safety System — Weekly Inspection Report"
      logoUrl={logoUrl}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <div><strong>Inspection ID:</strong> {id}</div>
        <div><strong>Department:</strong> {inspection.department}</div>
        <div><strong>Inspector:</strong> {inspection.inspector}</div>
        <div><strong>Created At:</strong> {new Date(inspection.createdAt).toLocaleString()}</div>
      </div>

      <table style={pdfTableStyles.table}>
        <thead>
          <tr>
            <th style={pdfTableStyles.th}>#</th>
            <th style={pdfTableStyles.th}>Description</th>
            <th style={pdfTableStyles.th}>Location</th>
            {columns.map((col) => (
              <th key={col} style={pdfTableStyles.th}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex}>
              <td style={pdfTableStyles.td}>{rowIndex + 1}</td>
              <td style={pdfTableStyles.td}>{row.description ?? ""}</td>
              <td style={pdfTableStyles.td}>{row.location ?? ""}</td>
              {(row.weeks ?? []).map((cell: string, colIndex: number) => (
                <td key={colIndex} style={pdfTableStyles.td}>{cell ?? ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </PdfDocument>
  );
}

async function MonthlyInspectionTemplate({ id }: { id: string }) {
  const inspection = await prisma.monthlyInspection.findUnique({
    where: { id },
    select: { id: true, department: true, inspector: true, createdAt: true, data: true, companyId: true },
  });

  if (!inspection) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
        <h1>Inspection not found</h1>
        <p>No monthly inspection exists for ID: {id}</p>
      </div>
    );
  }

  const defaultColumns = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let columns = defaultColumns;
  let rows: WeeklyMonthlyRow[] = [];

  try {
    if (inspection.data) {
      const raw = JSON.parse(inspection.data as string);
      columns = raw.columns ?? defaultColumns;
      rows = Array.isArray(raw.rows) ? raw.rows : [];
    }
  } catch {
    // keep defaults
  }

  const logoUrl = await getCompanyLogoUrl();

  return (
    <PdfDocument
      title="Monthly Inspection Report"
      documentType="Safety System — Monthly Inspection Report"
      logoUrl={logoUrl}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <div><strong>Inspection ID:</strong> {id}</div>
        <div><strong>Department:</strong> {inspection.department}</div>
        <div><strong>Inspector:</strong> {inspection.inspector}</div>
        <div><strong>Created At:</strong> {new Date(inspection.createdAt).toLocaleString()}</div>
      </div>

      <table style={pdfTableStyles.table}>
        <thead>
          <tr>
            <th style={pdfTableStyles.th}>#</th>
            <th style={pdfTableStyles.th}>Description</th>
            <th style={pdfTableStyles.th}>Location</th>
            {columns.map((col) => (
              <th key={col} style={pdfTableStyles.th}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex}>
              <td style={pdfTableStyles.td}>{rowIndex + 1}</td>
              <td style={pdfTableStyles.td}>{row.description ?? ""}</td>
              <td style={pdfTableStyles.td}>{row.location ?? ""}</td>
              {(row.months ?? []).map((cell: string, colIndex: number) => (
                <td key={colIndex} style={pdfTableStyles.td}>{cell ?? ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </PdfDocument>
  );
}

async function AppointmentTemplate({ id }: { id: string }) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
        <h1>Appointment not found</h1>
        <p>No appointment exists for ID: {id}</p>
      </div>
    );
  }

  const logoUrl = await getCompanyLogoUrl();
  const dateStr = new Date(appointment.date).toLocaleDateString();
  const TemplateComponent = appointmentTemplates[appointment.type as keyof typeof appointmentTemplates];

  return (
    <PdfDocument
      title="Appointment Letter"
      documentType="Safety System — Appointment Letter"
      logoUrl={logoUrl}
    >
      {TemplateComponent ? (
        <div style={{ ...bodyTextStyle, marginBottom: 28 }}>
          <TemplateComponent
            appointee={appointment.appointee}
            appointer={appointment.appointer}
            department={appointment.department}
            date={dateStr}
          />
        </div>
      ) : (
        <div style={{ ...bodyTextStyle, marginBottom: 28 }}>
          <p><strong>Type:</strong> {appointment.type}</p>
          <p><strong>Appointee:</strong> {appointment.appointee}</p>
          <p><strong>Appointer:</strong> {appointment.appointer}</p>
          <p><strong>Department:</strong> {appointment.department}</p>
          <p><strong>Date:</strong> {dateStr}</p>
        </div>
      )}

      <PdfSection title="Signatures">
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <PdfSignatureBlock
            label="Appointer"
            signature={appointment.appointerSignature}
            signedAt={appointment.appointerSignedAt != null ? (typeof appointment.appointerSignedAt === "string" ? appointment.appointerSignedAt : appointment.appointerSignedAt.toISOString()) : undefined}
          />
          <PdfSignatureBlock
            label="Appointee"
            signature={appointment.appointeeSignature}
            signedAt={appointment.appointeeSignedAt != null ? (typeof appointment.appointeeSignedAt === "string" ? appointment.appointeeSignedAt : appointment.appointeeSignedAt.toISOString()) : undefined}
          />
        </div>
      </PdfSection>
    </PdfDocument>
  );
}

function renderList(items: string[] | undefined) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <ul style={{ margin: 0, paddingLeft: 20 }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 4 }}>{item}</li>
      ))}
    </ul>
  );
}

async function IncidentTemplate({ id }: { id: string }) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      images: true,
      company: true,
      team: {
        select: {
          id: true,
          name: true,
          designation: true,
          signature: true,
          signedAt: true,
          createdAt: true,
        },
      },
    },
  });

  if (!incident) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
        <h1>Incident not found</h1>
        <p>No incident exists for ID: {id}</p>
      </div>
    );
  }

  let details: any = {};
  try {
    details =
      typeof incident.details === "string" && incident.details
        ? JSON.parse(incident.details)
        : incident.details || {};
  } catch {
    details = {};
  }

  const formatDate = (value: Date | string | null | undefined) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString();
  };

  const incidentTypes = details.incidentTypes ?? details.basic?.incidentTypes ?? [];
  const logoUrl = incident.company?.logoUrl ?? (await getCompanyLogoUrl(incident.companyId));

  // Stable order: creation order
  const team = incident.team?.length
    ? [...incident.team].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    : incident.team ?? [];

  return (
    <PdfDocument
      title={`Incident Report — ${incident.title}`}
      documentType="Safety System — Incident Report"
      logoUrl={logoUrl}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 20 }}>
        <p><strong>Incident ID:</strong> {incident.id}</p>
        {incident.company && <p><strong>Company:</strong> {incident.company.name}</p>}
        <p><strong>Title:</strong> {incident.title}</p>
        <p><strong>Type:</strong> {incident.type}</p>
        <p><strong>Date:</strong> {formatDate(incident.date)}</p>
        <p><strong>Department:</strong> {incident.department || "N/A"}</p>
        <p><strong>Location:</strong> {incident.location || "N/A"}</p>
        <p><strong>Employee:</strong> {incident.employee || "N/A"}{incident.employeeId ? ` (ID: ${incident.employeeId})` : ""}</p>
        <p><strong>Severity:</strong> {incident.severity}</p>
        <p><strong>Status:</strong> {incident.status}</p>
      </div>

      {incident.description && (
        <PdfSection title="Short Description">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{incident.description}</p>
        </PdfSection>
      )}

      {Array.isArray(incidentTypes) && incidentTypes.length > 0 && (
        <PdfSection title="Incident Types">
          {renderList(incidentTypes)}
        </PdfSection>
      )}

      {details.injuredPerson && Object.keys(details.injuredPerson).some((k) => details.injuredPerson[k]) && (
        <PdfSection title="Injured Person Details">
          <table style={pdfTableStyles.table}>
            <tbody>
              {Object.entries(details.injuredPerson).map(
                ([key, value]: [string, any]) =>
                  value && (
                    <tr key={key}>
                      <td style={{ ...pdfTableStyles.td, fontWeight: "bold", width: "30%" }}>{key}</td>
                      <td style={pdfTableStyles.td}>{String(value)}</td>
                    </tr>
                  )
              )}
            </tbody>
          </table>
        </PdfSection>
      )}

      {(details.injuryBodyParts?.length > 0 || details.injuryEffects?.length > 0 || details.injuryNature?.length) && (
        <PdfSection title="Injury Details">
          {details.injuryBodyParts?.length > 0 && <div><strong>Body Parts:</strong> {renderList(details.injuryBodyParts)}</div>}
          {details.injuryEffects?.length > 0 && <div style={{ marginTop: 8 }}><strong>Effects:</strong> {renderList(details.injuryEffects)}</div>}
          {details.injuryNature?.length > 0 && <div style={{ marginTop: 8 }}><strong>Nature:</strong> {renderList(details.injuryNature)}</div>}
          {details.natureOfInjury && <div style={{ marginTop: 8 }}><strong>Nature of Injury:</strong> {details.natureOfInjury}</div>}
        </PdfSection>
      )}

      {details.hazards?.length > 0 && (
        <PdfSection title="Hazards">
          {renderList(details.hazards)}
        </PdfSection>
      )}

      {details.rootCauses?.length > 0 && (
        <PdfSection title="Root Causes">
          {renderList(details.rootCauses)}
        </PdfSection>
      )}

      {details.correctiveActions?.length > 0 && (
        <PdfSection title="Corrective Actions">
          {renderList(details.correctiveActions)}
        </PdfSection>
      )}

      {details.correctiveNotes && (
        <PdfSection title="Corrective Notes">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{details.correctiveNotes}</p>
        </PdfSection>
      )}

      {details.narrative && (
        <PdfSection title="Incident Narrative">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{details.narrative}</p>
        </PdfSection>
      )}

      {team.length > 0 && (
        <PdfSection title="Investigation Team">
          <table style={pdfTableStyles.table}>
            <thead>
              <tr>
                <th style={pdfTableStyles.th}>Name</th>
                <th style={pdfTableStyles.th}>Designation</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member.id}>
                  <td style={pdfTableStyles.td}>{member.name}</td>
                  <td style={pdfTableStyles.td}>{member.designation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PdfSection>
      )}

      <PdfSection title="Signatures">
        {team.length > 0 ? (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {team.map((member) => (
              <PdfSignatureBlock
                key={member.id}
                label={`${member.name} — ${member.designation}`}
                signature={member.signature ?? null}
                signedAt={member.signedAt != null ? String(member.signedAt) : (member.createdAt != null ? String(member.createdAt) : null)}
              />
            ))}
          </div>
        ) : (
          <p style={{ ...bodyTextStyle, opacity: 0.8 }}>No signatures recorded.</p>
        )}
      </PdfSection>

      {incident.images.length > 0 && (
        <PdfSection title="Photos">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {incident.images.map((img) => (
              <div key={img.id} style={{ width: "30%" }}>
                <PdfImageBw
                  src={img.url}
                  alt="Incident"
                  style={{ width: "100%", height: "auto", border: "1px solid #000" }}
                />
              </div>
            ))}
          </div>
        </PdfSection>
      )}
    </PdfDocument>
  );
}

async function NcrTemplate({ id }: { id: string }) {
  const report = await prisma.ncrReport.findUnique({
    where: { id },
    include: {
      company: true,
      items: {
        include: {
          images: true,
        },
      },
    },
  });

  if (!report) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
        <h1>NCR report not found</h1>
        <p>No non-conformance report exists for ID: {id}</p>
      </div>
    );
  }

  const logoUrl = report.company?.logoUrl ?? (await getCompanyLogoUrl(report.companyId));

  return (
    <PdfDocument
      title="Non-Conformance Report"
      documentType="Safety System — Non-Conformance Report"
      logoUrl={logoUrl}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Report ID:</strong> {report.id}</p>
        {report.company && <p><strong>Company:</strong> {report.company.name}</p>}
        <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</p>
        <p><strong>Status:</strong> {report.status}</p>
        <p><strong>Department:</strong> {report.department || "N/A"}</p>
      </div>

      {report.items.length === 0 && (
        <p style={{ fontSize: 13 }}>No items captured for this report.</p>
      )}

      {report.items.map((item, index) => (
        <div
          key={item.id}
          style={{
            marginBottom: 25,
            paddingBottom: 15,
            borderBottom: "1px dashed #000000",
            ...bodyTextStyle,
          }}
        >
          <h2 style={{ fontSize: 15, marginBottom: 8 }}>
            Item {index + 1}: {item.description || "No description"}
          </h2>
          <p><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</p>
          <p><strong>Department:</strong> {item.department || "N/A"}</p>
          {item.comment && <p><strong>Comment:</strong> {item.comment}</p>}

          {item.images.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <strong>Images:</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
                {item.images.map((img) => (
                  <div key={img.id} style={{ width: "30%" }}>
                    <PdfImageBw
                      src={img.url}
                      alt="NCR"
                      style={{ width: "100%", height: "auto", border: "1px solid #000" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </PdfDocument>
  );
}

async function CertificateTemplate({ id }: { id: string }) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
        <h1>Invalid certificate ID</h1>
        <p>Expected a numeric ID, received: {id}</p>
      </div>
    );
  }

  const certificate = await prisma.certificate.findUnique({
    where: { id: numericId },
  });

  if (!certificate) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
        <h1>Certificate not found</h1>
        <p>No certificate exists for ID: {id}</p>
      </div>
    );
  }

  const formatDate = (value: Date | string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toISOString().split("T")[0];
  };

  const logoUrl = await getCompanyLogoUrl();

  return (
    <PdfDocument
      title="Training Certificate Summary"
      documentType="Safety System — Training Certificate"
      logoUrl={logoUrl}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Certificate ID:</strong> {certificate.id}</p>
        <p><strong>Employee:</strong> {certificate.employee}</p>
        <p><strong>Certificate:</strong> {certificate.certificateName}</p>
        <p><strong>Type:</strong> {certificate.certificateType || "Not specified"}</p>
        <p><strong>Issue Date:</strong> {formatDate(certificate.issueDate)}</p>
        <p><strong>Expiry Date:</strong> {formatDate(certificate.expiryDate)}</p>
        {certificate.notes && <p><strong>Notes:</strong> {certificate.notes}</p>}
        {certificate.fileUrl && <p><strong>Original File URL:</strong> {certificate.fileUrl}</p>}
      </div>
    </PdfDocument>
  );
}

async function MedicalTemplate({ id }: { id: string }) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
        <h1>Invalid medical ID</h1>
        <p>Expected a numeric ID, received: {id}</p>
      </div>
    );
  }

  const medical = await prisma.medical.findUnique({
    where: { id: numericId },
  });

  if (!medical) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
        <h1>Medical record not found</h1>
        <p>No medical exists for ID: {id}</p>
      </div>
    );
  }

  const formatDate = (value: Date | string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toISOString().split("T")[0];
  };

  const logoUrl = await getCompanyLogoUrl();

  return (
    <PdfDocument
      title="Medical Certificate Summary"
      documentType="Safety System — Medical Certificate"
      logoUrl={logoUrl}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Medical ID:</strong> {medical.id}</p>
        <p><strong>Employee:</strong> {medical.employee}</p>
        <p><strong>Medical Type:</strong> {medical.medicalType}</p>
        <p><strong>Issue Date:</strong> {formatDate(medical.issueDate)}</p>
        <p><strong>Expiry Date:</strong> {formatDate(medical.expiryDate)}</p>
        {medical.notes && <p><strong>Notes:</strong> {medical.notes}</p>}
        {medical.fileUrl && <p><strong>Original File URL:</strong> {medical.fileUrl}</p>}
      </div>
    </PdfDocument>
  );
}

async function RiskAssessmentTemplate({ id }: { id: string }) {
  const assessment = await prisma.riskAssessment.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!assessment) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
        <h1>Risk assessment not found</h1>
        <p>No risk assessment exists for ID: {id}</p>
      </div>
    );
  }

  const formatDate = (value: Date | string | null) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toISOString().split("T")[0];
  };

  const logoUrl = assessment.company?.logoUrl ?? (await getCompanyLogoUrl(assessment.companyId));

  return (
    <PdfDocument
      title={assessment.title}
      documentType="Safety System — Risk Assessment"
      logoUrl={logoUrl}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Assessment ID:</strong> {assessment.id}</p>
        {assessment.company && <p><strong>Company:</strong> {assessment.company.name}</p>}
        <p><strong>Title:</strong> {assessment.title}</p>
        <p><strong>Risk Level:</strong> {assessment.riskLevel}</p>
        <p><strong>Status:</strong> {assessment.status}</p>
        {assessment.department && <p><strong>Department:</strong> {assessment.department}</p>}
        {assessment.location && <p><strong>Location:</strong> {assessment.location}</p>}
        {assessment.assessor && <p><strong>Assessor:</strong> {assessment.assessor}</p>}
        {assessment.reviewDate && <p><strong>Review Date:</strong> {formatDate(assessment.reviewDate)}</p>}
        {assessment.industrySector && <p><strong>Industry Sector:</strong> {assessment.industrySector}</p>}
        {assessment.assessmentType && <p><strong>Assessment Type:</strong> {assessment.assessmentType}</p>}
      </div>

      {assessment.controls && (
        <PdfSection title="Controls / Mitigations">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{assessment.controls}</p>
        </PdfSection>
      )}

      <PdfSection title="Signatures">
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <PdfSignatureBlock
            label="Assessor"
            signature={assessment.signature}
            signedAt={assessment.signedAt != null ? (typeof assessment.signedAt === "string" ? assessment.signedAt : assessment.signedAt.toISOString()) : undefined}
          />
        </div>
      </PdfSection>
    </PdfDocument>
  );
}
