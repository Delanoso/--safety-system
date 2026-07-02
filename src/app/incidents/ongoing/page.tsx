"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Trash2, FileDown } from "lucide-react";
import TeamInvolvedEditor from "@/components/incident/TeamInvolvedEditor";
import { downloadPdf } from "@/lib/pdf-download";
import { incidentPdfDownloadType, incidentTypeLabel } from "@/lib/incident-constants";

/* -------------------------------------------------------
   REUSABLE UI COMPONENTS
------------------------------------------------------- */

function Section({ title, children }) {
  return (
    <div
      className="rounded-2xl p-5 backdrop-blur-xl shadow-xl"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      <h3 className="text-base font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function PillList({ items }) {
  if (!items || items.length === 0)
    return <p className="text-sm opacity-70">None</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="px-3 py-1 rounded-full text-xs"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide mb-1 opacity-70">
        {label}
      </div>
      <div className="text-sm">
        {value ?? <span className="opacity-50">N/A</span>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function safeParseDetails(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/* -------------------------------------------------------
   MAIN PAGE
------------------------------------------------------- */

export default function OngoingIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    const res = await fetch("/api/incidents", { cache: "no-store" });
    const json = await res.json();

    const list = Array.isArray(json)
      ? json
      : Array.isArray(json.incidents)
      ? json.incidents
      : [];

    const filtered = list.filter(
      (i) =>
        i.status === "draft" ||
        i.status === "in-progress" ||
        i.status === "ongoing"
    );

    setIncidents(filtered);
  }

  function toggleExpand(id) {
    setExpanded(expanded === id ? null : id);
  }

  async function deleteIncident(id) {
    const confirmDelete = confirm("Are you sure you want to delete this incident?");
    if (!confirmDelete) return;

    await fetch(`/api/incidents/${id}`, {
      method: "DELETE",
    });

    loadIncidents();
  }

  function formatDate(dateString) {
    const d = new Date(dateString);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
  }

  const fullIncidents = incidents.filter(
    (i) => i.type === "incident" || i.type === "accident" || i.type === "cost_analysis"
  );
  const nearMisses = incidents.filter((i) => i.type === "near_miss");

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 min-w-0">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">

        {/* HEADER */}
        <div
          className="rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-xl shadow-xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Ongoing Incidents</h1>
          <p className="opacity-70 mt-2 text-sm sm:text-base">
            All incidents still in progress or awaiting completion.
          </p>
        </div>

        {/* INCIDENTS SECTION */}
        <h2 className="text-xl sm:text-2xl font-bold mt-6 sm:mt-10">Incidents</h2>

        {fullIncidents.length === 0 && (
          <p className="text-center text-lg opacity-70">
            No ongoing incidents found.
          </p>
        )}

        <div className="space-y-4 sm:space-y-6">
          {fullIncidents.map((incident) => {
            const details = safeParseDetails(incident.details);

            return (
              <div
                key={incident.id}
                className="rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-xl"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                }}
              >
                <button
                  onClick={() => toggleExpand(incident.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <h2 className="text-xl font-semibold">{incident.title}</h2>
                    {incident.type === "accident" && (
                      <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40">
                        Accident
                      </span>
                    )}
                    {incident.type === "near_miss" && (
                      <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/40">
                        Near Miss
                      </span>
                    )}

                    <p className="opacity-70 text-sm mt-1">
                      {incident.description || "No short description provided"}
                    </p>

                    <p className="opacity-70 text-sm mt-1">
                      {formatDate(incident.date)}
                    </p>

                    <p className="opacity-70 text-sm">
                      {incident.type === "accident" ? "Area of Accident" : "Department"}:{" "}
                      {incident.department || "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPdf(incidentPdfDownloadType(incident.type), incident.id);
                      }}
                      className="cursor-pointer opacity-80 hover:opacity-100"
                      title="Download PDF"
                    >
                      <FileDown size={22} />
                    </button>
                    <div
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteIncident(incident.id);
                      }}
                      className="cursor-pointer"
                      style={{ color: "var(--button-delete-bg)" }}
                    >
                      <Trash2 size={22} />
                    </div>

                    {expanded === incident.id ? (
                      <ChevronUp size={26} />
                    ) : (
                      <ChevronDown size={26} />
                    )}
                  </div>
                </button>

                {expanded === incident.id && (
                  <div className="mt-6 space-y-6">
                    <IncidentReportLayout incident={incident} details={details} />
                    <TeamInvolvedEditor
                      incidentId={incident.id}
                      incidentTitle={incident.title}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* NEAR MISS SECTION */}
        <h2 className="text-2xl font-bold mt-10">Near Miss Reports</h2>

        {nearMisses.length === 0 && (
          <p className="text-center text-lg opacity-70">
            No near miss reports found.
          </p>
        )}

        <div className="space-y-6">
          {nearMisses.map((incident) => {
            const details = safeParseDetails(incident.details);

            return (
              <div
                key={incident.id}
                className="rounded-2xl p-6 backdrop-blur-xl shadow-xl"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                }}
              >
                <button
                  onClick={() => toggleExpand(incident.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <h2 className="text-xl font-semibold">{incident.title}</h2>
                    <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/40">
                      Near Miss
                    </span>

                    <p className="opacity-70 text-sm mt-1">
                      {incident.description || "No short description provided"}
                    </p>

                    <p className="opacity-70 text-sm mt-1">
                      {formatDate(incident.date)}
                    </p>

                    <p className="opacity-70 text-sm">
                      Department: {incident.department || "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadPdf(incidentPdfDownloadType(incident.type), incident.id);
                      }}
                      className="cursor-pointer opacity-80 hover:opacity-100"
                      title="Download PDF"
                    >
                      <FileDown size={22} />
                    </button>
                    <div
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteIncident(incident.id);
                      }}
                      className="cursor-pointer"
                      style={{ color: "var(--button-delete-bg)" }}
                    >
                      <Trash2 size={22} />
                    </div>

                    {expanded === incident.id ? (
                      <ChevronUp size={26} />
                    ) : (
                      <ChevronDown size={26} />
                    )}
                  </div>
                </button>

                {expanded === incident.id && (
                  <div className="mt-6 space-y-6">
                    <NearMissLayout incident={incident} details={details} />
                    <TeamInvolvedEditor
                      incidentId={incident.id}
                      incidentTitle={incident.title}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

/* -------------------------------------------------------
   INCIDENT REPORT LAYOUT
------------------------------------------------------- */

function IncidentReportLayout({ incident, details }) {
  const basic = details.basic || {};
  const isAccident = incident.type === "accident";
  const hasInjuries = isAccident ? Boolean(basic.hasInjuries) : true;
  const injured = details.injuredPerson || {};
  const additionalPeople = Array.isArray(basic.additionalPeople) ? basic.additionalPeople : [];
  const injuryBodyParts = details.injuryBodyParts || [];
  const injuryEffects = details.injuryEffects || [];
  const injuryNature = details.injuryNature || [];
  const hazards = Array.isArray(details.hazards) ? details.hazards : [];
  const rootCauses = details.rootCauses || [];
  const correctiveActions = details.correctiveActions || [];
  const correctiveNotes = details.correctiveNotes || "";
  const narrative = details.narrative || "";

  return (
    <div className="space-y-6">
      <Section title="Basic Information">
        <Grid>
          <Field label="Report Title" value={incident.title} />
          <Field
            label={isAccident ? "Report Type" : "Incident Type"}
            value={
              isAccident
                ? (basic.accidentCategories || []).join(", ")
                : (basic.incidentTypes || []).join(", ")
            }
          />
          <Field
            label={isAccident ? "Area of Accident" : "Department"}
            value={incident.department}
          />
          <Field label="Location" value={incident.location} />
          <Field
            label="Person Involved"
            value={incident.employee ? `${incident.employee}${incident.employeeId ? ` (${incident.employeeId})` : ""}` : undefined}
          />
          {(basic.additionalPeople || []).map((person, index) => (
            <Field
              key={`additional-person-${index}`}
              label={`Person Involved ${index + 2}`}
              value={person?.name ? `${person.name}${person.employeeId ? ` (${person.employeeId})` : ""}` : undefined}
            />
          ))}
          <Field label="Severity" value={incident.severity} />
          <Field label="Status" value={incident.status} />
        </Grid>
      </Section>

      {isAccident && (
        <Section title="Vehicle / Equipment Details">
          <Grid>
            <Field label="Vehicle or Equipment" value={basic.vehicleOrEquipment} />
            <Field label="Registration / Asset No." value={basic.registrationOrAssetId} />
            <Field label="Driver / Operator" value={basic.operatorOrDriver} />
            <Field
              label="Injuries"
              value={hasInjuries ? "Injuries reported" : "No injuries"}
            />
          </Grid>
          {basic.accidentCircumstances && (
            <p className="text-sm whitespace-pre-wrap mt-3">
              {basic.accidentCircumstances}
            </p>
          )}
        </Section>
      )}

      {hasInjuries && (
      <Section title={isAccident ? "Person Involved" : "Injured Persons"}>
        <Grid>
          <Field label="Person 1 - Name" value={injured.name} />
          <Field label="Person 1 - Surname" value={injured.surname} />
          <Field label="Person 1 - ID Number" value={injured.idNumber} />
          <Field label="Person 1 - Employee Number" value={injured.employeeNumber} />
          <Field label="Person 1 - Occupation" value={injured.occupation} />
          <Field label="Person 1 - Department" value={injured.department} />
          <Field label="Person 1 - Supervisor" value={injured.supervisor} />
          <Field label="Person 1 - Contact Number" value={injured.contactNumber} />
          <Field label="Person 1 - Address" value={injured.address} />
        </Grid>

        {additionalPeople.length > 0 && (
          <div className="mt-6 space-y-3">
            {isAccident && (
              <div className="text-sm font-semibold opacity-90">
                Additional Persons Involved
              </div>
            )}
            {additionalPeople.map((p, index) => (
              <div
                key={index}
                className="rounded-xl p-4"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                }}
              >
                <div className="text-sm font-semibold mb-2 opacity-90">
                  Person {index + 2}
                </div>
                <Grid>
                  <Field label="Name" value={p?.name} />
                  <Field label="Employee Number" value={p?.employeeId} />
                </Grid>
              </div>
            ))}
          </div>
        )}
      </Section>
      )}

      {hasInjuries && (
      <>
      <Section title="Injury Body Parts">
        {(() => {
          const labels = [
            [injured.name, injured.surname].filter(Boolean).join(" "),
            ...additionalPeople.map((p) => p?.name).filter(Boolean),
          ];
          if (labels.length <= 1) return null;
          return (
            <p className="text-sm opacity-70 mb-2">
              Recorded for: {labels.join(", ")}
            </p>
          );
        })()}
        <PillList items={injuryBodyParts} />
      </Section>

      <Section title="Injury Effects">
        {(() => {
          const labels = [
            [injured.name, injured.surname].filter(Boolean).join(" "),
            ...additionalPeople.map((p) => p?.name).filter(Boolean),
          ];
          if (labels.length <= 1) return null;
          return (
            <p className="text-sm opacity-70 mb-2">
              Recorded for: {labels.join(", ")}
            </p>
          );
        })()}
        <PillList items={injuryEffects} />
      </Section>

      <Section title="Injury Nature">
        {(() => {
          const labels = [
            [injured.name, injured.surname].filter(Boolean).join(" "),
            ...additionalPeople.map((p) => p?.name).filter(Boolean),
          ];
          if (labels.length <= 1) return null;
          return (
            <p className="text-sm opacity-70 mb-2">
              Recorded for: {labels.join(", ")}
            </p>
          );
        })()}
        <PillList items={injuryNature} />
      </Section>
      </>
      )}

      <Section title="Hazards">
        <PillList items={hazards} />
      </Section>

      <Section title="Root Causes">
        <PillList items={rootCauses} />
      </Section>

      <Section title="Corrective Actions">
        <PillList items={correctiveActions} />
      </Section>

      <Section title="Corrective Notes">
        <p className="text-sm whitespace-pre-wrap">
          {correctiveNotes || "No corrective notes captured."}
        </p>
      </Section>

      <Section title="Incident Narrative">
        <p className="text-sm whitespace-pre-wrap">
          {narrative || "No narrative captured."}
        </p>
      </Section>
    </div>
  );
}

/* -------------------------------------------------------
   NEAR MISS LAYOUT
------------------------------------------------------- */

function NearMissLayout({ incident, details }) {
  const basic = details.basic || {};
  const narrative = details.narrative || "";
  const hazardsObj = details.hazards || {};

  // Convert hazards object → list of selected hazards
  const selectedHazards = Object.entries(hazardsObj)
    .filter(([key, value]) => value && value !== "" && value !== null)
    .map(([key, value]) => {
      if (key === "hazardOther") return value; // custom text
      return key.replace(/([A-Z])/g, " $1").trim(); // format keys like "SlipTrip" → "Slip Trip"
    })
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <Section title="Basic Information">
        <Grid>
          <Field label="Person Name" value={basic.personName} />
          <Field label="Department" value={basic.department} />
          <Field label="Location" value={basic.location} />
          <Field label="Date" value={basic.date} />
          <Field label="Time" value={basic.time} />
        </Grid>
      </Section>

      <Section title="Hazards / Causes">
        <PillList items={selectedHazards} />
      </Section>

      <Section title="Description of Near Miss">
        <p className="text-sm whitespace-pre-wrap">
          {narrative || "No description provided."}
        </p>
      </Section>
    </div>
  );
}

