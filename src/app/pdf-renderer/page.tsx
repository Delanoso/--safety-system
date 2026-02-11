import React from "react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function PdfRendererPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const type = typeof searchParams.type === "string" ? searchParams.type : "";
  const id = typeof searchParams.id === "string" ? searchParams.id : "";

  if (!type || !id) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff" }}>
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

    default:
      return (
        <div style={{ padding: 40, fontFamily: "Arial", background: "#fff" }}>
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
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff" }}>
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

  return (
    <div
      style={{
        margin: 0,
        padding: 40,
        fontFamily: "Arial, sans-serif",
        background: "#ffffff",
        color: "#000000",
      }}
    >
      <div style={{ borderBottom: "2px solid #000", marginBottom: 30 }}>
        <h1 style={{ margin: 0 }}>Daily Inspection Report</h1>
        <div style={{ fontSize: 12 }}>Inspection ID: {id}</div>
      </div>

      <div style={{ marginBottom: 25, fontSize: 14 }}>
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

      <div
        style={{
          marginTop: 40,
          paddingTop: 10,
          borderTop: "1px solid #000",
          textAlign: "center",
          fontSize: 10,
        }}
      >
        Safety System — Daily Inspection Report
      </div>
    </div>
  );
}

async function AppointmentTemplate({ id }: { id: string }) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff" }}>
        <h1>Appointment not found</h1>
        <p>No appointment exists for ID: {id}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: 0,
        padding: 40,
        fontFamily: "Arial, sans-serif",
        background: "#ffffff",
        color: "#000000",
      }}
    >
      <div style={{ borderBottom: "2px solid #000", marginBottom: 30 }}>
        <h1 style={{ margin: 0 }}>Appointment Letter</h1>
        <div style={{ fontSize: 12 }}>Appointment ID: {appointment.id}</div>
      </div>

      <div style={{ marginBottom: 25, fontSize: 14, lineHeight: 1.6 }}>
        <p>
          <strong>Appointee:</strong> {appointment.appointee}
        </p>
        <p>
          <strong>Appointer:</strong> {appointment.appointer}
        </p>
        <p>
          <strong>Department:</strong> {appointment.department}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(appointment.date).toLocaleDateString()}
        </p>
        <p>
          <strong>Status:</strong> {appointment.status}
        </p>
        {appointment.appointeeEmail && (
          <p>
            <strong>Appointee Email:</strong> {appointment.appointeeEmail}
          </p>
        )}
        {appointment.appointerEmail && (
          <p>
            <strong>Appointer Email:</strong> {appointment.appointerEmail}
          </p>
        )}
      </div>

      <div
        style={{
          marginTop: 40,
          paddingTop: 10,
          borderTop: "1px solid #000",
          fontSize: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 30,
          }}
        >
          <div style={{ width: "45%" }}>
            <div
              style={{
                borderBottom: "1px solid #000",
                height: 40,
                marginBottom: 5,
              }}
            />
            <div>Appointer: {appointment.appointer}</div>
            <div>
              Date:{" "}
              {appointment.appointerSignedAt
                ? new Date(appointment.appointerSignedAt).toLocaleDateString()
                : "________________"}
            </div>
          </div>

          <div style={{ width: "45%" }}>
            <div
              style={{
                borderBottom: "1px solid #000",
                height: 40,
                marginBottom: 5,
              }}
            />
            <div>Appointee: {appointment.appointee}</div>
            <div>
              Date:{" "}
              {appointment.appointeeSignedAt
                ? new Date(appointment.appointeeSignedAt).toLocaleDateString()
                : "________________"}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 40,
            paddingTop: 10,
            borderTop: "1px solid #000",
            textAlign: "center",
            fontSize: 10,
          }}
        >
          Safety System — Appointment Letter
        </div>
      </div>
    </div>
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
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff" }}>
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

  return (
    <div
      style={{
        margin: 0,
        padding: 40,
        fontFamily: "Arial, sans-serif",
        background: "#ffffff",
        color: "#000000",
      }}
    >
      <div
        style={{
          borderBottom: "2px solid #000",
          marginBottom: 30,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Incident Report</h1>
          <div style={{ fontSize: 12 }}>Incident ID: {incident.id}</div>
          {incident.company && (
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Company: {incident.company.name}
            </div>
          )}
        </div>
        {incident.company?.logoUrl && (
          <div>
            <img
              src={incident.company.logoUrl}
              alt="Company logo"
              style={{
                maxHeight: 40,
                maxWidth: 160,
                objectFit: "contain",
              }}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
        <p>
          <strong>Title:</strong> {incident.title}
        </p>
        <p>
          <strong>Type:</strong> {incident.type}
        </p>
        <p>
          <strong>Date:</strong> {formatDate(incident.date)}
        </p>
        <p>
          <strong>Department:</strong> {incident.department || "N/A"}
        </p>
        <p>
          <strong>Location:</strong> {incident.location || "N/A"}
        </p>
        <p>
          <strong>Employee:</strong> {incident.employee || "N/A"}{" "}
          {incident.employeeId ? `(ID: ${incident.employeeId})` : ""}
        </p>
        <p>
          <strong>Severity:</strong> {incident.severity}
        </p>
        <p>
          <strong>Status:</strong> {incident.status}
        </p>
      </div>

      {incident.description && (
        <div style={{ marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Short Description</h2>
          <p>{incident.description}</p>
        </div>
      )}

      {details.narrative && (
        <div style={{ marginBottom: 20, fontSize: 13, lineHeight: 1.6 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Incident Narrative</h2>
          <p>{details.narrative}</p>
        </div>
      )}

      {Array.isArray(details.incidentTypes) &&
        details.incidentTypes.length > 0 && (
          <div style={{ marginBottom: 20, fontSize: 13 }}>
            <h2 style={{ fontSize: 16, marginBottom: 8 }}>Incident Types</h2>
            <ul>
              {details.incidentTypes.map((t: string) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}

      {details.injuredPerson && (
        <div style={{ marginBottom: 20, fontSize: 13 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>
            Injured Person Details
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <tbody>
              {Object.entries(details.injuredPerson).map(
                ([key, value]: [string, any]) =>
                  value && (
                    <tr key={key}>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: 6,
                          fontWeight: "bold",
                          width: "30%",
                        }}
                      >
                        {key}
                      </td>
                      <td
                        style={{ border: "1px solid #000", padding: 6 }}
                      >
                        {String(value)}
                      </td>
                    </tr>
                  )
              )}
            </tbody>
          </table>
        </div>
      )}

      {incident.team.length > 0 && (
        <div style={{ marginBottom: 20, fontSize: 13 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Investigation Team</h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr>
                <th style={{ border: "1px solid #000", padding: 6 }}>Name</th>
                <th style={{ border: "1px solid #000", padding: 6 }}>
                  Designation
                </th>
              </tr>
            </thead>
            <tbody>
              {incident.team.map((member) => (
                <tr key={member.id}>
                  <td style={{ border: "1px solid #000", padding: 6 }}>
                    {member.name}
                  </td>
                  <td style={{ border: "1px solid #000", padding: 6 }}>
                    {member.designation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {incident.images.length > 0 && (
        <div style={{ marginBottom: 20, fontSize: 13 }}>
          <h2 style={{ fontSize: 16, marginBottom: 8 }}>Photos</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {incident.images.map((img) => (
              <div key={img.id} style={{ width: "30%" }}>
                <img
                  src={img.url}
                  alt="Incident"
                  style={{
                    width: "100%",
                    height: "auto",
                    border: "1px solid #000",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: 40,
          paddingTop: 10,
          borderTop: "1px solid #000",
          textAlign: "center",
          fontSize: 10,
        }}
      >
        Safety System — Incident Report
      </div>
    </div>
  );
}

async function NcrTemplate({ id }: { id: string }) {
  const report = await prisma.ncrReport.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          images: true,
        },
      },
    },
  });

  if (!report) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff" }}>
        <h1>NCR report not found</h1>
        <p>No non-conformance report exists for ID: {id}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: 0,
        padding: 40,
        fontFamily: "Arial, sans-serif",
        background: "#ffffff",
        color: "#000000",
      }}
    >
      <div style={{ borderBottom: "2px solid #000", marginBottom: 30 }}>
        <h1 style={{ margin: 0 }}>Non-Conformance Report</h1>
        <div style={{ fontSize: 12 }}>Report ID: {report.id}</div>
        <div style={{ fontSize: 12 }}>
          Created: {new Date(report.createdAt).toLocaleString()}
        </div>
        <div style={{ fontSize: 12 }}>
          Status: {report.status} | Department: {report.department || "N/A"}
        </div>
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
          <p>
            <strong>Date:</strong>{" "}
            {new Date(item.date).toLocaleDateString()}
          </p>
          <p>
            <strong>Department:</strong> {item.department || "N/A"}
          </p>
          {item.comment && (
            <p>
              <strong>Comment:</strong> {item.comment}
            </p>
          )}

          {item.images.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <strong>Images:</strong>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginTop: 6,
                }}
              >
                {item.images.map((img) => (
                  <div key={img.id} style={{ width: "30%" }}>
                    <img
                      src={img.url}
                      alt="NCR"
                      style={{
                        width: "100%",
                        height: "auto",
                        border: "1px solid #000",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <div
        style={{
          marginTop: 40,
          paddingTop: 10,
          borderTop: "1px solid #000",
          textAlign: "center",
          fontSize: 10,
        }}
      >
        Safety System — Non-Conformance Report
      </div>
    </div>
  );
}

async function CertificateTemplate({ id }: { id: string }) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff" }}>
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
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff" }}>
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

  return (
    <div
      style={{
        margin: 0,
        padding: 40,
        fontFamily: "Arial, sans-serif",
        background: "#ffffff",
        color: "#000000",
      }}
    >
      <div style={{ borderBottom: "2px solid #000", marginBottom: 30 }}>
        <h1 style={{ margin: 0 }}>Training Certificate Summary</h1>
        <div style={{ fontSize: 12 }}>Certificate ID: {certificate.id}</div>
      </div>

      <div style={{ marginBottom: 25, fontSize: 14, lineHeight: 1.6 }}>
        <p>
          <strong>Employee:</strong> {certificate.employee}
        </p>
        <p>
          <strong>Certificate:</strong> {certificate.certificateName}
        </p>
        <p>
          <strong>Type:</strong>{" "}
          {certificate.certificateType || "Not specified"}
        </p>
        <p>
          <strong>Issue Date:</strong> {formatDate(certificate.issueDate)}
        </p>
        <p>
          <strong>Expiry Date:</strong> {formatDate(certificate.expiryDate)}
        </p>
        {certificate.notes && (
          <p>
            <strong>Notes:</strong> {certificate.notes}
          </p>
        )}
        {certificate.fileUrl && (
          <p>
            <strong>Original File URL:</strong> {certificate.fileUrl}
          </p>
        )}
      </div>

      <div
        style={{
          marginTop: 40,
          paddingTop: 10,
          borderTop: "1px solid #000",
          textAlign: "center",
          fontSize: 10,
        }}
      >
        Safety System — Training Certificate Summary
      </div>
    </div>
  );
}
