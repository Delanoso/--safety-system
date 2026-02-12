import React from "react";
import { prisma } from "@/lib/prisma";
import { PdfDocument, PdfImageBw, PdfSection } from "@/components/pdf/PdfDocument";
import { getCompanyLogoUrl } from "@/lib/pdf";
import appointmentTemplates from "@/app/appointments/templates";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

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
      <div style={{ marginBottom: 25, fontSize: 14 }}>
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

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 12,
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #000", padding: 6 }}>#</th>
            <th
              style={{ border: "1px solid #000", padding: 6, textAlign: "left" }}
            >
              Inspection Item
            </th>
            {columns.map((col) => (
              <th key={col} style={{ border: "1px solid #000", padding: 6 }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {legendItems.map((item, rowIndex) => (
            <tr key={rowIndex}>
              <td style={{ border: "1px solid #000", padding: 6 }}>
                {rowIndex + 1}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: 6,
                  textAlign: "left",
                }}
              >
                {item}
              </td>
              {columns.map((_, colIndex) => (
                <td
                  key={colIndex}
                  style={{ border: "1px solid #000", padding: 6 }}
                >
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
        <div
          style={{
            marginBottom: 28,
            fontSize: 14,
            lineHeight: 1.6,
            color: "#000",
          }}
        >
          <TemplateComponent
            appointee={appointment.appointee}
            appointer={appointment.appointer}
            department={appointment.department}
            date={dateStr}
          />
        </div>
      ) : (
        <div style={{ marginBottom: 28, fontSize: 14, lineHeight: 1.6 }}>
          <p><strong>Type:</strong> {appointment.type}</p>
          <p><strong>Appointee:</strong> {appointment.appointee}</p>
          <p><strong>Appointer:</strong> {appointment.appointer}</p>
          <p><strong>Department:</strong> {appointment.department}</p>
          <p><strong>Date:</strong> {dateStr}</p>
        </div>
      )}

      <PdfSection title="Signature Timeline">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <strong>Appointee Signed At</strong>
            <div style={{ marginTop: 4 }}>
              {appointment.appointeeSignedAt
                ? new Date(appointment.appointeeSignedAt).toLocaleString()
                : "Not signed"}
            </div>
          </div>
          <div>
            <strong>Appointer Signed At</strong>
            <div style={{ marginTop: 4 }}>
              {appointment.appointerSignedAt
                ? new Date(appointment.appointerSignedAt).toLocaleString()
                : "Not signed"}
            </div>
          </div>
        </div>
      </PdfSection>

      {(appointment.appointeeSignature || appointment.appointerSignature) && (
        <PdfSection title="Final Signatures">
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            {appointment.appointerSignature && (
              <div>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>Appointer Signature</div>
                <img
                  src={appointment.appointerSignature}
                  alt="Appointer signature"
                  style={{ maxWidth: 180, maxHeight: 60, border: "1px solid #000" }}
                />
              </div>
            )}
            {appointment.appointeeSignature && (
              <div>
                <div style={{ fontWeight: "bold", marginBottom: 4 }}>Appointee Signature</div>
                <img
                  src={appointment.appointeeSignature}
                  alt="Appointee signature"
                  style={{ maxWidth: 180, maxHeight: 60, border: "1px solid #000" }}
                />
              </div>
            )}
          </div>
        </PdfSection>
      )}
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
      team: true,
      company: true,
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

  return (
    <PdfDocument
      title={`Incident Report — ${incident.title}`}
      documentType="Safety System — Incident Report"
      logoUrl={logoUrl}
    >
      <div style={{ marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
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
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <tbody>
              {Object.entries(details.injuredPerson).map(
                ([key, value]: [string, any]) =>
                  value && (
                    <tr key={key}>
                      <td style={{ border: "1px solid #000", padding: 6, fontWeight: "bold", width: "30%" }}>{key}</td>
                      <td style={{ border: "1px solid #000", padding: 6 }}>{String(value)}</td>
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

      {incident.team.length > 0 && (
        <PdfSection title="Investigation Team">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", padding: 6 }}>Name</th>
                <th style={{ border: "1px solid #000", padding: 6 }}>Designation</th>
              </tr>
            </thead>
            <tbody>
              {incident.team.map((member) => (
                <tr key={member.id}>
                  <td style={{ border: "1px solid #000", padding: 6 }}>{member.name}</td>
                  <td style={{ border: "1px solid #000", padding: 6 }}>{member.designation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PdfSection>
      )}

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
      <div style={{ marginBottom: 25, fontSize: 14 }}>
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
            borderBottom: "1px dashed #000",
            fontSize: 13,
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
      <div style={{ marginBottom: 25, fontSize: 14, lineHeight: 1.6 }}>
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
      <div style={{ marginBottom: 25, fontSize: 14, lineHeight: 1.6 }}>
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
      <div style={{ marginBottom: 25, fontSize: 14, lineHeight: 1.6 }}>
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

      {assessment.signature && (
        <PdfSection title="Signature">
          <p style={{ marginBottom: 8, fontSize: 12 }}>
            <strong>Signed:</strong> {assessment.signedAt ? formatDate(assessment.signedAt) : "N/A"}
          </p>
          <img
            src={assessment.signature}
            alt="Signature"
            style={{ maxWidth: 200, maxHeight: 80, border: "1px solid #000" }}
          />
        </PdfSection>
      )}
    </PdfDocument>
  );
}
