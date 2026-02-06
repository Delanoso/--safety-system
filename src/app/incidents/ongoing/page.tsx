"use client";

import { useEffect, useState } from "react";
import SignaturePad from "react-signature-canvas";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

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

  const fullIncidents = incidents.filter((i) => i.type !== "near_miss");
  const nearMisses = incidents.filter((i) => i.type === "near_miss");

  return (
    <div className="min-h-screen p-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* HEADER */}
        <div
          className="rounded-2xl p-8 backdrop-blur-xl shadow-xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h1 className="text-4xl font-bold">Ongoing Incidents</h1>
          <p className="opacity-70 mt-2">
            All incidents still in progress or awaiting completion.
          </p>
        </div>

        {/* INCIDENTS SECTION */}
        <h2 className="text-2xl font-bold mt-10">Incidents</h2>

        {fullIncidents.length === 0 && (
          <p className="text-center text-lg opacity-70">
            No ongoing incidents found.
          </p>
        )}

        <div className="space-y-6">
          {fullIncidents.map((incident) => {
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
                    <TeamInvolved incidentId={incident.id} />
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
                    <TeamInvolved incidentId={incident.id} />
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
  const injured = details.injuredPerson || {};
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
          <Field label="Incident Title" value={incident.title} />
          <Field
            label="Incident Type"
            value={(basic.incidentTypes || []).join(", ")}
          />
          <Field label="Department" value={incident.department} />
          <Field label="Location" value={incident.location} />
          <Field label="Severity" value={incident.severity} />
          <Field label="Status" value={incident.status} />
        </Grid>
      </Section>

      <Section title="Injured Person">
        <Grid>
          <Field label="Name" value={injured.name} />
          <Field label="Surname" value={injured.surname} />
          <Field label="ID Number" value={injured.idNumber} />
          <Field label="Employee Number" value={injured.employeeNumber} />
          <Field label="Occupation" value={injured.occupation} />
          <Field label="Department" value={injured.department} />
          <Field label="Supervisor" value={injured.supervisor} />
          <Field label="Contact Number" value={injured.contactNumber} />
          <Field label="Address" value={injured.address} />
        </Grid>
      </Section>

      <Section title="Injury Body Parts">
        <PillList items={injuryBodyParts} />
      </Section>

      <Section title="Injury Effects">
        <PillList items={injuryEffects} />
      </Section>

      <Section title="Injury Nature">
        <PillList items={injuryNature} />
      </Section>

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
   TEAM INVOLVED
------------------------------------------------------- */

function TeamInvolved({ incidentId }) {
  const [team, setTeam] = useState([]);
  const [newName, setNewName] = useState("");
  const [newDesignation, setNewDesignation] = useState("");
  const [newSignature, setNewSignature] = useState("");
  const [padRef, setPadRef] = useState(null);

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    const res = await fetch(`/api/incidents/${incidentId}`, {
      cache: "no-store",
    });
    const json = await res.json();

    if (json.team) {
      setTeam(
        json.team.map((m) => ({
          ...m,
          signature: m.signature || "",
        }))
      );
    }
  }

  async function addMember() {
    if (!newName || !newDesignation || !newSignature) {
      alert("Name, designation, and signature are required.");
      return;
    }

    const res = await fetch(`/api/incidents/team/add/${incidentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, designation: newDesignation }),
    });

    const json = await res.json();

    if (!json.success) {
      alert("Failed to add member.");
      return;
    }

    const memberId = json.member.id;

    await fetch(`/api/incidents/${incidentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId: memberId,
        value: newSignature,
      }),
    });

    setTeam((prev) => [
      ...prev,
      {
        id: memberId,
        name: newName,
        designation: newDesignation,
        signature: newSignature,
      },
    ]);

    setNewName("");
    setNewDesignation("");
    setNewSignature("");
    padRef?.clear();
  }

  async function removeMember(id) {
    await fetch(`/api/incidents/team/delete/${id}`, {
      method: "DELETE",
    });

    setTeam((prev) => prev.filter((m) => m.id !== id));
  }

  async function completeIncident() {
    await fetch(`/api/incidents/${incidentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });

    window.location.href = "/incidents/list";
  }

  return (
    <Section title="Team Involved">
      <div
        className="mb-6 p-4 rounded-xl"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <Grid>
          <div>
            <label className="text-xs uppercase tracking-wide opacity-70">
              Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border text-sm"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wide opacity-70">
              Designation
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border text-sm"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
            />
          </div>
        </Grid>

        <div className="mt-4">
          <label className="text-sm">Signature</label>

          <SignaturePad
            penColor="black"
            canvasProps={{
              width: 350,
              height: 120,
              className:
                "bg-white rounded-xl border border-gray-300 shadow-md",
            }}
            ref={(ref) => setPadRef(ref)}
          />

          <button
            onClick={() => {
              if (padRef) {
                const data = padRef.getTrimmedCanvas().toDataURL();
                setNewSignature(data);
                alert("Signature captured.");
              }
            }}
            className="button button-save mt-2"
          >
            Add Signature
          </button>
        </div>

        <button onClick={addMember} className="button button-save mt-4">
          + Add Team Member
        </button>
      </div>

      {team.map((member) => (
        <div
          key={member.id}
          className="relative mb-6 p-4 rounded-xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <div
            role="button"
            onClick={() => removeMember(member.id)}
            className="absolute top-3 right-3 cursor-pointer"
            style={{ color: "var(--button-delete-bg)" }}
          >
            <Trash2 size={20} />
          </div>

          <Grid>
            <Field label="Name" value={member.name} />
            <Field label="Designation" value={member.designation} />
          </Grid>

          {member.signature && (
            <img
              src={member.signature}
              alt="Signature"
              className="mt-4 w-48 border border-gray-300 rounded-lg bg-white"
            />
          )}
        </div>
      ))}

      <button
        onClick={completeIncident}
        className="button button-save w-full mt-4"
      >
        Completed AND Signed
      </button>
    </Section>
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

