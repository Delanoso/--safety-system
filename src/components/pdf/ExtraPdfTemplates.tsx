import React from "react";
import { prisma } from "@/lib/prisma";
import {
  PdfDocument,
  PdfImageBw,
  PdfSection,
  pdfTableStyles,
} from "@/components/pdf/PdfDocument";
import { getCompanyPdfBranding, resolvePdfBranding } from "@/lib/pdf";
import {
  computeContractorCompliance,
  getApplicableSections,
  parseExcludedSections,
} from "@/lib/contractor-compliance";
import { CONTRACTOR_SECTIONS } from "@/lib/contractor-sections";
import { drillStatusLabel, drillTypeLabel } from "@/lib/emergency-drills";
import { MAINTENANCE_TYPES } from "@/lib/maintenance-templates";
import { formatDateDisplay, statusLabel } from "@/lib/legal-compliance";
import {
  permitStatusLabel,
  permitTypeLabel,
} from "@/lib/site-safety";
import { attendeeDisplayName, isAttendeeSigned } from "@/lib/toolbox-talk-attendees";

const bodyTextStyle: React.CSSProperties = {
  color: "#111827",
  fontSize: 14,
  lineHeight: 1.6,
};

function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function PdfNotFound({ title, id }: { title: string; id: string }) {
  return (
    <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
      <h1>{title}</h1>
      <p>No record exists for ID: {id}</p>
    </div>
  );
}

function PdfInvalidId({ title, id }: { title: string; id: string }) {
  return (
    <div style={{ padding: 40, fontFamily: "Arial", background: "#fff", color: "#000" }}>
      <h1>{title}</h1>
      <p>Expected a numeric ID, received: {id}</p>
    </div>
  );
}

export async function ToolboxTalkPdfTemplate({ id }: { id: string }) {
  const talk = await prisma.toolboxTalk.findUnique({
    where: { id },
    include: {
      company: true,
      attendees: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!talk) {
    return <PdfNotFound title="Toolbox talk not found" id={id} />;
  }

  const { logoUrl, companyName } = await resolvePdfBranding(
    talk.companyId,
    talk.company
  );

  return (
    <PdfDocument
      title={talk.title}
      documentType="Salus — Toolbox Talk"
      logoUrl={logoUrl}
      companyName={companyName}
      entityId={id}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Record ID:</strong> {talk.id}</p>
        {talk.topic && <p><strong>Topic:</strong> {talk.topic}</p>}
        <p><strong>Date:</strong> {formatDate(talk.talkDate)}</p>
        <p><strong>Presenter:</strong> {talk.presenter ?? "—"}</p>
        <p><strong>Department:</strong> {talk.department ?? "—"}</p>
        <p><strong>Location:</strong> {talk.location ?? "—"}</p>
        <p>
          <strong>Duration:</strong>{" "}
          {talk.durationMinutes != null ? `${talk.durationMinutes} minutes` : "—"}
        </p>
        <p><strong>Status:</strong> {talk.status}</p>
      </div>

      {talk.notes && (
        <PdfSection title="Notes">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{talk.notes}</p>
        </PdfSection>
      )}

      <PdfSection title="Attendees">
        {talk.attendees.length === 0 ? (
          <p style={{ margin: 0, opacity: 0.8 }}>No attendees recorded.</p>
        ) : (
          <table style={pdfTableStyles.table}>
            <thead>
              <tr>
                <th style={pdfTableStyles.th}>#</th>
                <th style={pdfTableStyles.th}>Name</th>
                <th style={pdfTableStyles.th}>ID Number</th>
                <th style={pdfTableStyles.th}>Department</th>
                <th style={pdfTableStyles.th}>Signature</th>
                <th style={pdfTableStyles.th}>Signed at</th>
              </tr>
            </thead>
            <tbody>
              {talk.attendees.map((attendee, index) => (
                <tr key={attendee.id}>
                  <td style={pdfTableStyles.td}>{index + 1}</td>
                  <td style={pdfTableStyles.td}>{attendeeDisplayName(attendee)}</td>
                  <td style={pdfTableStyles.td}>{attendee.idNumber ?? "—"}</td>
                  <td style={pdfTableStyles.td}>{attendee.department ?? "—"}</td>
                  <td style={pdfTableStyles.td}>
                    {attendee.signature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={attendee.signature}
                        alt="Signature"
                        style={{ height: 36, maxWidth: 100, objectFit: "contain" }}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={pdfTableStyles.td}>
                    {attendee.signedAt
                      ? formatDateTime(attendee.signedAt)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ marginTop: 12, fontSize: 11, opacity: 0.75 }}>
          {talk.attendees.filter((a) => isAttendeeSigned(a)).length} of{" "}
          {talk.attendees.length} attendees signed
        </p>
      </PdfSection>
    </PdfDocument>
  );
}

export async function PermitToWorkPdfTemplate({ id }: { id: string }) {
  const permit = await prisma.permitToWork.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!permit) {
    return <PdfNotFound title="Permit to work not found" id={id} />;
  }

  const { logoUrl, companyName } = await resolvePdfBranding(
    permit.companyId,
    permit.company
  );

  return (
    <PdfDocument
      title={permit.title}
      documentType="Salus — Permit to Work"
      logoUrl={logoUrl}
      companyName={companyName}
      entityId={id}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Permit ID:</strong> {permit.id}</p>
        <p><strong>Permit Number:</strong> {permit.permitNumber ?? "—"}</p>
        <p><strong>Permit Type:</strong> {permitTypeLabel(permit.permitType)}</p>
        <p><strong>Status:</strong> {permitStatusLabel(permit.status)}</p>
        <p><strong>Department:</strong> {permit.department ?? "—"}</p>
        <p><strong>Location:</strong> {permit.location ?? "—"}</p>
        <p><strong>Start Date:</strong> {formatDate(permit.startDate)}</p>
        <p><strong>End Date:</strong> {formatDate(permit.endDate)}</p>
        <p><strong>Issuer:</strong> {permit.issuerName ?? "—"}</p>
        <p><strong>Receiver:</strong> {permit.receiverName ?? "—"}</p>
      </div>

      {permit.workDescription && (
        <PdfSection title="Work Description">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{permit.workDescription}</p>
        </PdfSection>
      )}

      {permit.hazards && (
        <PdfSection title="Hazards">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{permit.hazards}</p>
        </PdfSection>
      )}

      {permit.controls && (
        <PdfSection title="Controls">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{permit.controls}</p>
        </PdfSection>
      )}
    </PdfDocument>
  );
}

export async function EmergencyDrillPdfTemplate({ id }: { id: string }) {
  const drill = await prisma.emergencyDrill.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!drill) {
    return <PdfNotFound title="Emergency drill not found" id={id} />;
  }

  const { logoUrl, companyName } = await resolvePdfBranding(
    drill.companyId,
    drill.company
  );

  return (
    <PdfDocument
      title={drill.title}
      documentType="Salus — Emergency Drill Report"
      logoUrl={logoUrl}
      companyName={companyName}
      entityId={id}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Drill ID:</strong> {drill.id}</p>
        <p><strong>Drill Type:</strong> {drillTypeLabel(drill.drillType)}</p>
        <p><strong>Status:</strong> {drillStatusLabel(drill.status)}</p>
        <p><strong>Date:</strong> {formatDate(drill.drillDate)}</p>
        <p><strong>Location:</strong> {drill.location ?? "—"}</p>
        <p><strong>Department:</strong> {drill.department ?? "—"}</p>
        <p><strong>Coordinator:</strong> {drill.coordinator ?? "—"}</p>
        <p>
          <strong>Participants:</strong>{" "}
          {drill.participantCount != null ? drill.participantCount : "—"}
        </p>
        <p>
          <strong>Duration:</strong>{" "}
          {drill.durationMinutes != null ? `${drill.durationMinutes} minutes` : "—"}
        </p>
      </div>

      {drill.findings && (
        <PdfSection title="Findings">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{drill.findings}</p>
        </PdfSection>
      )}

      {drill.correctiveActions && (
        <PdfSection title="Corrective Actions">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{drill.correctiveActions}</p>
        </PdfSection>
      )}
    </PdfDocument>
  );
}

export async function InductionTrainingPdfTemplate({ id }: { id: string }) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    return <PdfInvalidId title="Invalid induction training ID" id={id} />;
  }

  const record = await prisma.inductionTraining.findUnique({
    where: { id: numericId },
    include: { company: true },
  });

  if (!record) {
    return <PdfNotFound title="Induction training not found" id={id} />;
  }

  const { logoUrl, companyName } = await resolvePdfBranding(
    record.companyId,
    record.company
  );

  return (
    <PdfDocument
      title="Induction Training Record"
      documentType="Salus — Induction Training"
      logoUrl={logoUrl}
      companyName={companyName}
      entityId={id}
    >
      <table style={pdfTableStyles.table}>
        <tbody>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold", width: "34%" }}>Record ID</td>
            <td style={pdfTableStyles.td}>{record.id}</td>
          </tr>
          {record.company && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Company</td>
              <td style={pdfTableStyles.td}>{record.company.name}</td>
            </tr>
          )}
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Employee</td>
            <td style={pdfTableStyles.td}>{record.employee}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Induction Type</td>
            <td style={pdfTableStyles.td}>{record.inductionType}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Issue Date</td>
            <td style={pdfTableStyles.td}>{formatDate(record.issueDate)}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Expiry Date</td>
            <td style={pdfTableStyles.td}>{formatDate(record.expiryDate)}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Department</td>
            <td style={pdfTableStyles.td}>{record.department ?? "—"}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Trainer</td>
            <td style={pdfTableStyles.td}>{record.trainer ?? "—"}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Status</td>
            <td style={pdfTableStyles.td}>{record.status}</td>
          </tr>
          {record.notes && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Notes</td>
              <td style={{ ...pdfTableStyles.td, whiteSpace: "pre-wrap" }}>{record.notes}</td>
            </tr>
          )}
        </tbody>
      </table>
    </PdfDocument>
  );
}

export async function VisitorRegisterPdfTemplate({ id }: { id: string }) {
  const entry = await prisma.visitorRegisterEntry.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!entry) {
    return <PdfNotFound title="Visitor register entry not found" id={id} />;
  }

  const { logoUrl, companyName } = await resolvePdfBranding(
    entry.companyId,
    entry.company
  );

  return (
    <PdfDocument
      title="Visitor Register Entry"
      documentType="Salus — Visitor Register"
      logoUrl={logoUrl}
      companyName={companyName}
      entityId={id}
    >
      <table style={pdfTableStyles.table}>
        <tbody>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold", width: "34%" }}>Entry ID</td>
            <td style={pdfTableStyles.td}>{entry.id}</td>
          </tr>
          {entry.company && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Company</td>
              <td style={pdfTableStyles.td}>{entry.company.name}</td>
            </tr>
          )}
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Visitor Name</td>
            <td style={pdfTableStyles.td}>{entry.visitorName}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Visitor Company</td>
            <td style={pdfTableStyles.td}>{entry.visitorCompany ?? "—"}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>ID Number</td>
            <td style={pdfTableStyles.td}>{entry.idNumber ?? "—"}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Contact Number</td>
            <td style={pdfTableStyles.td}>{entry.contactNumber ?? "—"}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Host</td>
            <td style={pdfTableStyles.td}>{entry.hostName}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Host Department</td>
            <td style={pdfTableStyles.td}>{entry.hostDepartment ?? "—"}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Purpose</td>
            <td style={pdfTableStyles.td}>{entry.purpose ?? "—"}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Location</td>
            <td style={pdfTableStyles.td}>{entry.location ?? "—"}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Vehicle Registration</td>
            <td style={pdfTableStyles.td}>{entry.vehicleReg ?? "—"}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Check In</td>
            <td style={pdfTableStyles.td}>{formatDateTime(entry.checkInAt)}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Check Out</td>
            <td style={pdfTableStyles.td}>{formatDateTime(entry.checkOutAt)}</td>
          </tr>
          {entry.notes && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Notes</td>
              <td style={{ ...pdfTableStyles.td, whiteSpace: "pre-wrap" }}>{entry.notes}</td>
            </tr>
          )}
        </tbody>
      </table>
    </PdfDocument>
  );
}

export async function LegalCompliancePdfTemplate({ id }: { id: string }) {
  const item = await prisma.legalComplianceItem.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!item) {
    return <PdfNotFound title="Legal compliance item not found" id={id} />;
  }

  const { logoUrl, companyName } = await resolvePdfBranding(
    item.companyId,
    item.company
  );

  return (
    <PdfDocument
      title="Legal Compliance Register Item"
      documentType="Salus — Legal Compliance Register"
      logoUrl={logoUrl}
      companyName={companyName}
      entityId={id}
    >
      <table style={pdfTableStyles.table}>
        <tbody>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold", width: "34%" }}>Item ID</td>
            <td style={pdfTableStyles.td}>{item.id}</td>
          </tr>
          {item.company && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Company</td>
              <td style={pdfTableStyles.td}>{item.company.name}</td>
            </tr>
          )}
          {item.auditRef && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Audit Ref</td>
              <td style={pdfTableStyles.td}>{item.auditRef}</td>
            </tr>
          )}
          {item.section && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Section</td>
              <td style={pdfTableStyles.td}>{item.section}</td>
            </tr>
          )}
          {item.subsection && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Subsection</td>
              <td style={pdfTableStyles.td}>{item.subsection}</td>
            </tr>
          )}
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Legislation</td>
            <td style={pdfTableStyles.td}>{item.legislation}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Requirement</td>
            <td style={{ ...pdfTableStyles.td, whiteSpace: "pre-wrap" }}>{item.requirement}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Applies To</td>
            <td style={pdfTableStyles.td}>{item.appliesTo ?? "—"}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Status</td>
            <td style={pdfTableStyles.td}>{statusLabel(item.status)}</td>
          </tr>
          {item.weight != null && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Weight</td>
              <td style={pdfTableStyles.td}>{item.weight}</td>
            </tr>
          )}
          {item.achieved && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Achieved</td>
              <td style={pdfTableStyles.td}>{item.achieved}</td>
            </tr>
          )}
          {item.score != null && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Score</td>
              <td style={pdfTableStyles.td}>{item.score}</td>
            </tr>
          )}
          {item.responsiblePerson && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Responsible Person</td>
              <td style={pdfTableStyles.td}>{item.responsiblePerson}</td>
            </tr>
          )}
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Last Reviewed</td>
            <td style={pdfTableStyles.td}>{formatDateDisplay(item.lastReviewedAt)}</td>
          </tr>
          <tr>
            <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Next Review Due</td>
            <td style={pdfTableStyles.td}>{formatDateDisplay(item.nextReviewDue)}</td>
          </tr>
          {item.evidenceNotes && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Evidence Notes</td>
              <td style={{ ...pdfTableStyles.td, whiteSpace: "pre-wrap" }}>{item.evidenceNotes}</td>
            </tr>
          )}
          {item.notes && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Notes</td>
              <td style={{ ...pdfTableStyles.td, whiteSpace: "pre-wrap" }}>{item.notes}</td>
            </tr>
          )}
          {item.observations && (
            <tr>
              <td style={{ ...pdfTableStyles.td, fontWeight: "bold" }}>Observations</td>
              <td style={{ ...pdfTableStyles.td, whiteSpace: "pre-wrap" }}>{item.observations}</td>
            </tr>
          )}
        </tbody>
      </table>
    </PdfDocument>
  );
}

export async function ContractorSafetyFilePdfTemplate({ id }: { id: string }) {
  const contractor = await prisma.contractor.findUnique({
    where: { id },
    include: {
      company: true,
      documents: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!contractor) {
    return <PdfNotFound title="Contractor not found" id={id} />;
  }

  const { logoUrl, companyName } = await resolvePdfBranding(
    contractor.companyId,
    contractor.company
  );

  const excluded = parseExcludedSections(contractor.excludedSections);
  const applicable = getApplicableSections(excluded);
  const compliance = computeContractorCompliance(
    contractor.documents,
    contractor.excludedSections
  );

  const docsBySection: Record<string, { fileName: string }[]> = {};
  for (const doc of contractor.documents) {
    if (!docsBySection[doc.section]) docsBySection[doc.section] = [];
    docsBySection[doc.section].push({ fileName: doc.fileName });
  }

  const scopeLabel =
    contractor.scope === "specific_job" ? "Specific Job" : "Ongoing";

  return (
    <PdfDocument
      title={`Contractor Safety File — ${contractor.name}`}
      documentType="Salus — Contractor Safety File"
      logoUrl={logoUrl}
      companyName={companyName}
      entityId={id}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Contractor ID:</strong> {contractor.id}</p>
        <p><strong>Contractor:</strong> {contractor.name}</p>
        <p><strong>Scope:</strong> {scopeLabel}</p>
        {contractor.contactEmail && (
          <p><strong>Email:</strong> {contractor.contactEmail}</p>
        )}
        {contractor.contactPhone && (
          <p><strong>Phone:</strong> {contractor.contactPhone}</p>
        )}
        {contractor.jobDescription && (
          <p><strong>Job Description:</strong> {contractor.jobDescription}</p>
        )}
        <p>
          <strong>Compliance:</strong> {compliance.percentage}%{" "}
          ({compliance.completeCount} of {compliance.applicableCount} applicable sections complete)
        </p>
        {compliance.excludedCount > 0 && (
          <p><strong>Excluded Sections:</strong> {compliance.excludedCount}</p>
        )}
      </div>

      <PdfSection title="Applicable Safety File Sections">
        <table style={pdfTableStyles.table}>
          <thead>
            <tr>
              <th style={pdfTableStyles.th}>Section</th>
              <th style={pdfTableStyles.th}>Status</th>
              <th style={pdfTableStyles.th}>Documents</th>
            </tr>
          </thead>
          <tbody>
            {applicable.map((section) => {
              const docs = docsBySection[section.id] ?? [];
              const sectionStatus = compliance.sections.find((s) => s.id === section.id);
              const statusText = sectionStatus?.complete
                ? "Complete"
                : "Missing";

              return (
                <tr key={section.id}>
                  <td style={pdfTableStyles.td}>{section.label}</td>
                  <td style={pdfTableStyles.td}>{statusText}</td>
                  <td style={pdfTableStyles.td}>
                    {docs.length > 0
                      ? docs.map((d) => d.fileName).join(", ")
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </PdfSection>

      {excluded.length > 0 && (
        <PdfSection title="Excluded Sections (Not Applicable)">
          <table style={pdfTableStyles.table}>
            <thead>
              <tr>
                <th style={pdfTableStyles.th}>Section</th>
                <th style={pdfTableStyles.th}>Documents on File</th>
              </tr>
            </thead>
            <tbody>
              {CONTRACTOR_SECTIONS.filter((s) => excluded.includes(s.id)).map((section) => {
                const docs = docsBySection[section.id] ?? [];
                return (
                  <tr key={section.id}>
                    <td style={pdfTableStyles.td}>{section.label}</td>
                    <td style={pdfTableStyles.td}>
                      {docs.length > 0
                        ? docs.map((d) => d.fileName).join(", ")
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </PdfSection>
      )}
    </PdfDocument>
  );
}

function maintenanceTypeLabel(type: string): string {
  return MAINTENANCE_TYPES.find((t) => t.id === type)?.label ?? type;
}

export async function MaintenanceSchedulePdfTemplate({ id }: { id: string }) {
  const schedule = await prisma.maintenanceSchedule.findUnique({
    where: { id },
    include: {
      company: true,
      items: {
        include: {
          services: { orderBy: { serviceDate: "desc" }, take: 1 },
        },
        orderBy: { equipmentId: "asc" },
      },
    },
  });

  if (!schedule) {
    return <PdfNotFound title="Maintenance schedule not found" id={id} />;
  }

  const { logoUrl, companyName } = await resolvePdfBranding(
    schedule.companyId,
    schedule.company
  );

  return (
    <PdfDocument
      title={schedule.title}
      documentType="Salus — Maintenance Schedule"
      logoUrl={logoUrl}
      companyName={companyName}
      entityId={id}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Schedule:</strong> {schedule.title}</p>
        <p><strong>Type:</strong> {maintenanceTypeLabel(schedule.type)}</p>
        <p><strong>Items:</strong> {schedule.items.length}</p>
      </div>

      <PdfSection title="Equipment & Service Status">
        {schedule.items.length === 0 ? (
          <p style={{ margin: 0, opacity: 0.8 }}>No items in this schedule.</p>
        ) : (
          <table style={pdfTableStyles.table}>
            <thead>
              <tr>
                <th style={pdfTableStyles.th}>Equipment ID</th>
                <th style={pdfTableStyles.th}>Last Service</th>
                <th style={pdfTableStyles.th}>Next Due</th>
                <th style={pdfTableStyles.th}>Performed By</th>
              </tr>
            </thead>
            <tbody>
              {schedule.items.map((item) => {
                const latest = item.services[0];
                return (
                  <tr key={item.id}>
                    <td style={pdfTableStyles.td}>{item.equipmentId}</td>
                    <td style={pdfTableStyles.td}>
                      {latest ? formatDate(latest.serviceDate) : "—"}
                    </td>
                    <td style={pdfTableStyles.td}>
                      {latest?.nextDueDate ? formatDate(latest.nextDueDate) : "—"}
                    </td>
                    <td style={pdfTableStyles.td}>{latest?.performedBy ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </PdfSection>
    </PdfDocument>
  );
}

export async function HazardousChemicalsRegisterPdfTemplate({
  companyId,
}: {
  companyId: string;
}) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, logoUrl: true },
  });

  const chemicals = await prisma.hazardousChemical.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
  });

  const { logoUrl, companyName } = await resolvePdfBranding(companyId, company);

  return (
    <PdfDocument
      title="Hazardous Chemicals Register"
      documentType="Salus — Hazardous Chemicals Register"
      logoUrl={logoUrl}
      companyName={companyName}
      entityId={companyId}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Total chemicals:</strong> {chemicals.length}</p>
        <p><strong>Generated:</strong> {formatDateTime(new Date())}</p>
      </div>

      <PdfSection title="Chemical Inventory">
        {chemicals.length === 0 ? (
          <p style={{ margin: 0, opacity: 0.8 }}>No chemicals recorded.</p>
        ) : (
          <table style={pdfTableStyles.table}>
            <thead>
              <tr>
                <th style={pdfTableStyles.th}>Name</th>
                <th style={pdfTableStyles.th}>CAS</th>
                <th style={pdfTableStyles.th}>Location</th>
                <th style={pdfTableStyles.th}>Qty</th>
                <th style={pdfTableStyles.th}>Hazard Class</th>
                <th style={pdfTableStyles.th}>SDS</th>
              </tr>
            </thead>
            <tbody>
              {chemicals.map((c) => (
                <tr key={c.id}>
                  <td style={pdfTableStyles.td}>{c.name}</td>
                  <td style={pdfTableStyles.td}>{c.casNumber ?? "—"}</td>
                  <td style={pdfTableStyles.td}>{c.location ?? "—"}</td>
                  <td style={pdfTableStyles.td}>
                    {[c.quantity, c.unit].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td style={pdfTableStyles.td}>{c.hazardClass ?? "—"}</td>
                  <td style={pdfTableStyles.td}>{c.sdsUrl ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </PdfSection>
    </PdfDocument>
  );
}

export async function PpeIssuePdfTemplate({ id }: { id: string }) {
  const numId = Number(id);
  if (!Number.isInteger(numId)) {
    return <PdfInvalidId title="PPE issue not found" id={id} />;
  }

  const issue = await prisma.pPEIssue.findUnique({
    where: { id: numId },
    include: {
      person: true,
      itemType: { include: { company: true } },
    },
  });

  if (!issue) {
    return <PdfNotFound title="PPE issue not found" id={id} />;
  }

  const { logoUrl, companyName } = await resolvePdfBranding(
    issue.itemType.companyId,
    issue.itemType.company
  );

  return (
    <PdfDocument
      title={`PPE Issue — ${issue.person.name}`}
      documentType="Salus — PPE Issue Record"
      logoUrl={logoUrl}
      companyName={companyName}
      entityId={id}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Person:</strong> {issue.person.name}</p>
        <p><strong>Item:</strong> {issue.itemType.name}</p>
        <p><strong>Quantity:</strong> {issue.quantity}</p>
        <p><strong>Issue date:</strong> {formatDate(issue.issueDate)}</p>
        <p><strong>Status:</strong> {issue.status.replace(/_/g, " ")}</p>
        {issue.signedAt && (
          <p><strong>Signed at:</strong> {formatDateTime(issue.signedAt)}</p>
        )}
      </div>

      {issue.signature && (
        <PdfSection title="Signature">
          <PdfImageBw src={issue.signature} alt="Signature" style={{ maxWidth: 280 }} />
        </PdfSection>
      )}
    </PdfDocument>
  );
}

function formatMoney(value: unknown, currency = "ZAR"): string {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return "—";
  return `${currency} ${n.toFixed(2)}`;
}

export async function CostAnalysisPdfTemplate({ id }: { id: string }) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!incident || incident.type !== "cost_analysis") {
    const legacy = await prisma.costAnalysis.findUnique({
      where: { id },
      include: { incident: { include: { company: true } } },
    });
    if (!legacy) {
      return <PdfNotFound title="Cost analysis not found" id={id} />;
    }

    const { logoUrl, companyName } = await resolvePdfBranding(
      legacy.incident?.companyId,
      legacy.incident?.company
    );

    return (
      <PdfDocument
        title="Incident Cost Analysis"
        documentType="Salus — Cost Analysis"
        logoUrl={logoUrl}
        companyName={companyName}
        entityId={id}
      >
        <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
          {legacy.incident && (
            <p><strong>Incident:</strong> {legacy.incident.title}</p>
          )}
          <p><strong>Direct cost:</strong> {formatMoney(legacy.directCost)}</p>
          <p><strong>Indirect cost:</strong> {formatMoney(legacy.indirectCost)}</p>
          <p><strong>Other cost:</strong> {formatMoney(legacy.otherCost)}</p>
          <p><strong>Total:</strong> {formatMoney(legacy.totalCost)}</p>
          {legacy.notes && (
            <p style={{ whiteSpace: "pre-wrap" }}><strong>Notes:</strong> {legacy.notes}</p>
          )}
        </div>
      </PdfDocument>
    );
  }

  let details: Record<string, unknown> = {};
  try {
    details =
      typeof incident.details === "string" && incident.details
        ? (JSON.parse(incident.details) as Record<string, unknown>)
        : {};
  } catch {
    details = {};
  }

  const currency = (details.currency as string) || "ZAR";
  const basic = (details.basic as Record<string, unknown>) ?? {};
  const { logoUrl, companyName } = await resolvePdfBranding(
    incident.companyId,
    incident.company
  );

  return (
    <PdfDocument
      title={`Cost Analysis — ${incident.title}`}
      documentType="Salus — Incident Cost Analysis"
      logoUrl={logoUrl}
      companyName={companyName}
      entityId={id}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Title:</strong> {incident.title}</p>
        <p><strong>Person:</strong> {(basic.personName as string) ?? incident.employee ?? "—"}</p>
        <p><strong>Department:</strong> {(basic.department as string) ?? incident.department ?? "—"}</p>
        <p><strong>Date:</strong> {formatDate(incident.date)}</p>
        <p><strong>Grand total:</strong> {formatMoney(details.grandTotal, currency)}</p>
      </div>

      {details.medicalCosts != null && (
        <PdfSection title="Medical Costs">
          <p style={{ margin: 0 }}>
            Subtotal: {formatMoney((details.medicalCosts as { subtotal?: number }).subtotal, currency)}
          </p>
        </PdfSection>
      )}
      {details.timeCosts != null && (
        <PdfSection title="Time Costs">
          <p style={{ margin: 0 }}>
            Subtotal: {formatMoney((details.timeCosts as { subtotal?: number }).subtotal, currency)}
          </p>
        </PdfSection>
      )}
      {details.damage != null && (
        <PdfSection title="Property Damage">
          <p style={{ margin: 0 }}>
            Subtotal: {formatMoney((details.damage as { subtotal?: number }).subtotal, currency)}
          </p>
        </PdfSection>
      )}
      {details.productLoss != null && (
        <PdfSection title="Product Loss">
          <p style={{ margin: 0 }}>
            Subtotal: {formatMoney((details.productLoss as { subtotal?: number }).subtotal, currency)}
          </p>
        </PdfSection>
      )}
      {details.environmentalImpact != null && (
        <PdfSection title="Environmental Impact">
          <p style={{ margin: 0 }}>
            Subtotal: {formatMoney((details.environmentalImpact as { subtotal?: number }).subtotal, currency)}
          </p>
        </PdfSection>
      )}
    </PdfDocument>
  );
}

export async function SheMeetingPdfTemplate({ id }: { id: string }) {
  const meeting = await prisma.sHECommitteeMeeting.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!meeting) {
    return <PdfNotFound title="SHE meeting not found" id={id} />;
  }

  let attendees: string[] = [];
  try {
    attendees = meeting.attendees ? (JSON.parse(meeting.attendees) as string[]) : [];
  } catch {
    attendees = [];
  }

  let actionItems: { description?: string; assignee?: string; dueDate?: string }[] = [];
  try {
    actionItems = meeting.actionItems
      ? (JSON.parse(meeting.actionItems) as { description?: string; assignee?: string; dueDate?: string }[])
      : [];
  } catch {
    actionItems = [];
  }

  const { logoUrl, companyName } = await resolvePdfBranding(
    meeting.companyId,
    meeting.company
  );

  return (
    <PdfDocument
      title={`SHE Committee Meeting — ${formatDate(meeting.date)}`}
      documentType="Salus — SHE Committee Meeting"
      logoUrl={logoUrl}
      companyName={companyName}
      entityId={id}
    >
      <div style={{ ...bodyTextStyle, marginBottom: 25 }}>
        <p><strong>Date:</strong> {formatDate(meeting.date)}</p>
      </div>

      {meeting.agenda && (
        <PdfSection title="Agenda">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{meeting.agenda}</p>
        </PdfSection>
      )}

      {attendees.length > 0 && (
        <PdfSection title="Attendees">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {attendees.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        </PdfSection>
      )}

      {meeting.minutes && (
        <PdfSection title="Minutes">
          <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{meeting.minutes}</p>
        </PdfSection>
      )}

      {actionItems.length > 0 && (
        <PdfSection title="Action Items">
          <table style={pdfTableStyles.table}>
            <thead>
              <tr>
                <th style={pdfTableStyles.th}>Description</th>
                <th style={pdfTableStyles.th}>Assignee</th>
                <th style={pdfTableStyles.th}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {actionItems.map((item, i) => (
                <tr key={i}>
                  <td style={pdfTableStyles.td}>{item.description ?? "—"}</td>
                  <td style={pdfTableStyles.td}>{item.assignee ?? "—"}</td>
                  <td style={pdfTableStyles.td}>{item.dueDate ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PdfSection>
      )}
    </PdfDocument>
  );
}
