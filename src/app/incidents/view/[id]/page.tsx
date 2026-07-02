"use client";

import { Fragment, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileDown, ArrowLeft } from "lucide-react";
import { downloadPdf } from "@/lib/pdf-download";
import { ViewSignatureBlock } from "@/components/ViewSignatureBlock";

export default function IncidentViewerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    if (id) loadIncident();
  }, [id]);

  async function loadIncident() {
    try {
      const res = await fetch(`/api/incidents/${id}`, { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setIncident(null);
        setLoading(false);
        setError(res.status === 403 ? "You don't have permission to view this incident." : (json.error || "Incident not found."));
        return;
      }
      const parsedDetails =
        typeof json.details === "string"
          ? safeParse(json.details)
          : json.details;

      setIncident({ ...json, details: parsedDetails });
      setError(null);
    } catch (e) {
      console.error("Failed to load incident:", e);
      setError("Failed to load incident.");
    } finally {
      setLoading(false);
    }
  }

  function safeParse(str) {
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  }

  function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading incident...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">{error || "Incident not found."}</p>
      </div>
    );
  }

  const details = incident.details || {};

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 min-w-0">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-10">

        {/* TOP BAR */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => router.back()}
            className="button button-neutral flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            type="button"
            className="button button-pdf flex items-center gap-2"
            onClick={() => {
              if (!incident) return;
              downloadPdf("incident", incident.id);
            }}
          >
            <FileDown size={20} />
            Download PDF
          </button>
        </div>

        {/* FORM CONTAINER */}
        <div
          className="rounded-2xl p-4 sm:p-6 lg:p-10 backdrop-blur-xl shadow-xl space-y-6 sm:space-y-10"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          {/* HEADER */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{incident.title}</h1>
            <p className="opacity-70">
              {incident.type === "accident"
                ? "Completed Accident Report"
                : "Completed Incident Report"}{" "}
              • {formatDate(incident.date)}
            </p>

            <div className="flex gap-3 flex-wrap pt-2">
              <Badge>{incident.severity}</Badge>
              <Badge>{incident.department || "No Department"}</Badge>
              <Badge>Incident ID: {incident.id}</Badge>
              <Badge>Status: {incident.status}</Badge>
            </div>
          </div>

          <Divider />

          {/* BASIC INFORMATION */}
          <Section title="Basic Information">
            <InfoGrid>
              <Info label="Title" value={incident.title} bigLabel />
              <Info label="Date" value={formatDate(incident.date)} bigLabel />
              <Info
                label={incident.type === "accident" ? "Area of Accident" : "Department"}
                value={incident.department}
                bigLabel
              />
              <Info label="Location" value={incident.location} bigLabel />
              <Info label="Employee" value={incident.employee} bigLabel />
              <Info label="Employee ID" value={incident.employeeId} bigLabel />
              {(details.basic?.additionalPeople || []).map((person, index) => (
                <Fragment key={`person-${index}`}>
                  <Info
                    label={`Person Involved ${index + 2}`}
                    value={person?.name}
                    bigLabel
                  />
                  <Info
                    label={`Employee ID ${index + 2}`}
                    value={person?.employeeId}
                    bigLabel
                  />
                </Fragment>
              ))}
              <Info label="Severity" value={incident.severity} bigLabel />
            </InfoGrid>
          </Section>

          <Divider />

          {/* TEAM INVOLVED */}
          {incident.team?.length > 0 && (
            <Section title="Team Involved">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {incident.team.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-xl p-4 space-y-3"
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    <Info label="Name" value={member.name} />
                    <Info label="Designation" value={member.designation} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* SIGNATURES — always show so they’re visible on view and match PDF */}
          <Section title="Signatures">
            {incident.team?.length > 0 ? (
              <div className="flex flex-wrap gap-6">
                {incident.team.map((member) => (
                  <ViewSignatureBlock
                    key={member.id}
                    label={`${member.name} — ${member.designation}`}
                    signature={member.signature ?? null}
                    signedAt={member.signedAt ?? member.createdAt ?? null}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-70">No signatures recorded.</p>
            )}
          </Section>

          <Divider />

          {/* INCIDENT TYPES */}
          {details.basic?.incidentTypes?.length > 0 && (
            <Section title="Incident Types">
              <PillList items={details.basic.incidentTypes} />
            </Section>
          )}

          {/* ACCIDENT DETAILS */}
          {incident.type === "accident" && (
            <>
              <Divider />
              <Section title="Accident Category">
                <PillList items={details.basic?.accidentCategories || []} />
              </Section>
              <Divider />
              <Section title="Vehicle / Equipment Details">
                <InfoGrid>
                  <Info
                    label="Vehicle or Equipment"
                    value={details.basic?.vehicleOrEquipment}
                    bigLabel
                  />
                  <Info
                    label="Registration / Asset No."
                    value={details.basic?.registrationOrAssetId}
                    bigLabel
                  />
                  <Info
                    label="Driver / Operator"
                    value={details.basic?.operatorOrDriver}
                    bigLabel
                  />
                  <Info
                    label="Injuries"
                    value={
                      details.basic?.hasInjuries
                        ? "Injuries reported"
                        : "No injuries"
                    }
                    bigLabel
                  />
                </InfoGrid>
                {details.basic?.accidentCircumstances && (
                  <p className="text-sm whitespace-pre-wrap mt-4 leading-relaxed">
                    {details.basic.accidentCircumstances}
                  </p>
                )}
              </Section>
            </>
          )}

          {/* INJURED PERSON */}
          {details.injuredPerson &&
            (incident.type !== "accident" || details.basic?.hasInjuries) && (
            <>
              <Divider />
              <Section
                title={
                  incident.type === "accident"
                    ? "Person Involved"
                    : "Injured Person Details"
                }
              >
                <InfoGrid>
                  {Object.entries(details.injuredPerson).map(([key, value]) =>
                    value ? (
                      <Info key={key} label={key} value={value} bigLabel />
                    ) : null
                  )}
                </InfoGrid>

                {Array.isArray(details.basic?.additionalPeople) &&
                  details.basic.additionalPeople.length > 0 && (
                    <div className="mt-8 space-y-3">
                      <div className="text-sm font-semibold opacity-85">
                        {incident.type === "accident"
                          ? "Additional Persons Involved"
                          : "Additional injured persons"}
                      </div>
                      {details.basic.additionalPeople.map((p, index) => (
                        <div
                          key={index}
                          className="rounded-xl p-4"
                          style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                          }}
                        >
                          <p className="text-sm font-semibold">
                            Person {index + 2}
                          </p>
                          <p className="text-sm opacity-80">
                            {p?.name ? p.name : "N/A"}
                            {p?.employeeId
                              ? ` (ID: ${p.employeeId})`
                              : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
              </Section>
            </>
          )}

          {/* BODY PARTS */}
          {details.injuryBodyParts?.length > 0 &&
            (incident.type !== "accident" || details.basic?.hasInjuries) && (
            <>
              <Divider />
              <Section title="Body Parts Affected">
                {Array.isArray(details.basic?.additionalPeople) &&
                  details.basic.additionalPeople.length > 0 && (
                    <p className="text-sm opacity-70 mb-2">
                      Recorded for:{" "}
                      {[ 
                        [details.injuredPerson?.name, details.injuredPerson?.surname]
                          .filter(Boolean)
                          .join(" "),
                        ...details.basic.additionalPeople
                          .map((p) => p?.name)
                          .filter(Boolean),
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                <PillList items={details.injuryBodyParts} />
              </Section>
            </>
          )}

          {/* EFFECTS */}
          {details.injuryEffects?.length > 0 &&
            (incident.type !== "accident" || details.basic?.hasInjuries) && (
            <>
              <Divider />
              <Section title="Effects on Person">
                {Array.isArray(details.basic?.additionalPeople) &&
                  details.basic.additionalPeople.length > 0 && (
                    <p className="text-sm opacity-70 mb-2">
                      Recorded for:{" "}
                      {[ 
                        [details.injuredPerson?.name, details.injuredPerson?.surname]
                          .filter(Boolean)
                          .join(" "),
                        ...details.basic.additionalPeople
                          .map((p) => p?.name)
                          .filter(Boolean),
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                <PillList items={details.injuryEffects} />
              </Section>
            </>
          )}

          {/* NATURE OF INJURY */}
          {details.injuryNature?.length > 0 &&
            (incident.type !== "accident" || details.basic?.hasInjuries) && (
            <>
              <Divider />
              <Section title="Nature of Injury">
                {Array.isArray(details.basic?.additionalPeople) &&
                  details.basic.additionalPeople.length > 0 && (
                    <p className="text-sm opacity-70 mb-2">
                      Recorded for:{" "}
                      {[ 
                        [details.injuredPerson?.name, details.injuredPerson?.surname]
                          .filter(Boolean)
                          .join(" "),
                        ...details.basic.additionalPeople
                          .map((p) => p?.name)
                          .filter(Boolean),
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                <PillList items={details.injuryNature} />
              </Section>
            </>
          )}

          {/* HAZARDS */}
          {details.hazards?.length > 0 && (
            <>
              <Divider />
              <Section title="Hazards">
                <PillList items={details.hazards} />
              </Section>
            </>
          )}

          {/* ROOT CAUSES */}
          {details.rootCauses?.length > 0 && (
            <>
              <Divider />
              <Section title="Root Causes">
                <PillList items={details.rootCauses} />
              </Section>
            </>
          )}

          {/* CORRECTIVE ACTIONS */}
          {details.correctiveActions?.length > 0 && (
            <>
              <Divider />
              <Section title="Corrective Actions">
                <ul className="list-disc list-inside text-sm space-y-1">
                  {details.correctiveActions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </Section>
            </>
          )}

          {/* CORRECTIVE NOTES */}
          {details.correctiveNotes && (
            <>
              <Divider />
              <Section title="Corrective Notes">
                <p className="text-sm whitespace-pre-wrap">
                  {details.correctiveNotes}
                </p>
              </Section>
            </>
          )}

          {/* NARRATIVE */}
          {details.narrative && (
            <>
              <Divider />
              <Section title="Incident Narrative">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {details.narrative}
                </p>
              </Section>
            </>
          )}

          {/* PHOTOS */}
          {incident.images?.length > 0 && (
            <>
              <Divider />
              <Section title="Photos">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {incident.images.map((img) => (
                    <div
                      key={img.id}
                      className="rounded-xl p-2"
                      style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                      }}
                    >
                      <img
                        src={img.url}
                        alt="Incident photo"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* ------------------------------------------------------- */}
          {/* COST ANALYSIS VIEWER SECTION */}
          {/* ------------------------------------------------------- */}

          {incident.type === "cost_analysis" && (
            <>
              <Divider />
              <Section title="Cost Analysis Summary">
                <InfoGrid>
                  <Info label="Currency" value={details.currency} bigLabel />
                  <Info
                    label="Grand Total"
                    value={
                      details.grandTotal
                        ? `${details.currency === "USD"
                            ? "$"
                            : details.currency === "EUR"
                            ? "€"
                            : "R"
                          } ${details.grandTotal.toFixed(2)}`
                        : "N/A"
                    }
                    bigLabel
                  />
                </InfoGrid>
              </Section>

              {/* CLASSIFICATION */}
              {details.classification && (
                <>
                  <Divider />
                  <Section title="Incident Classification">
                    <PillList
                      items={Object.entries(details.classification)
                        .filter(([_, v]) => v)
                        .map(([k]) =>
                          k
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (c) => c.toUpperCase())
                        )}
                    />
                  </Section>
                </>
              )}

              {/* BASIC COST INFO */}
              {details.basic && (
                <>
                  <Divider />
                  <Section title="Basic Cost Information">
                    <InfoGrid>
                      <Info label="Person Name" value={details.basic.personName} />
                      <Info label="Age" value={details.basic.age} />
                      <Info label="Date" value={details.basic.date} />
                      <Info label="Time" value={details.basic.time} />
                      <Info label="Department" value={details.basic.department} />
                    </InfoGrid>
                  </Section>
                </>
              )}

              {/* NATURE OF INJURY */}
              {details.natureOfInjury && (
                <>
                  <Divider />
                  <Section title="Nature of Injury">
                    <p className="text-sm whitespace-pre-wrap">
                      {details.natureOfInjury}
                    </p>
                  </Section>
                </>
              )}

              {/* MEDICAL COSTS */}
              {details.medicalCosts && (
                <>
                  <Divider />
                  <Section title="Medical Costs">
                    <InfoGrid>
                      <Info
                        label="Clinic Cost"
                        value={details.medicalCosts.clinicCost}
                      />
                      <Info
                        label="Doctor Cost"
                        value={details.medicalCosts.doctorCost}
                      />
                      <Info
                        label="Hospital Cost"
                        value={details.medicalCosts.hospitalCost}
                      />
                      <Info
                        label="Subtotal"
                        value={`${details.currency === "USD"
                            ? "$"
                            : details.currency === "EUR"
                            ? "€"
                            : "R"
                          } ${details.medicalCosts.subtotal.toFixed(2)}`}
                        bigLabel
                      />
                    </InfoGrid>
                  </Section>
                </>
              )}

              {/* TIME COSTS */}
              {details.timeCosts && (
                <>
                  <Divider />
                  <Section title="Time-Based Costs">
                    <div className="space-y-4">
                      {details.timeCosts.rows.map((row, i) => (
                        <div
                          key={i}
                          className="rounded-xl p-4"
                          style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                          }}
                        >
                          <InfoGrid>
                            <Info label="Description" value={row.label} />
                            <Info label="Hours" value={row.hours} />
                            <Info label="Rate" value={row.rate} />
                            <Info
                              label="Total"
                              value={`${details.currency === "USD"
                                  ? "$"
                                  : details.currency === "EUR"
                                  ? "€"
                                  : "R"
                                } ${(Number(row.hours) * Number(row.rate)).toFixed(
                                  2
                                )}`}
                            />
                          </InfoGrid>
                        </div>
                      ))}

                      <p className="font-bold text-lg">
                        Subtotal:{" "}
                        {details.currency === "USD"
                          ? "$"
                          : details.currency === "EUR"
                          ? "€"
                          : "R"}{" "}
                        {details.timeCosts.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </Section>
                </>
              )}

              {/* ADDITIONAL COSTS */}
              {details.additionalCosts && (
                <>
                  <Divider />
                  <Section title="Additional Direct Costs">
                    <InfoGrid>
                      <Info
                        label="Overtime Cost"
                        value={details.additionalCosts.overtimeCost}
                      />
                      <Info
                        label="Replacement Cost"
                        value={details.additionalCosts.replacementCost}
                      />
                      <Info
                        label="Subtotal"
                        value={`${details.currency === "USD"
                            ? "$"
                            : details.currency === "EUR"
                            ? "€"
                            : "R"
                          } ${details.additionalCosts.subtotal.toFixed(2)}`}
                        bigLabel
                      />
                    </InfoGrid>
                  </Section>
                </>
              )}

              {/* DAMAGE */}
              {details.damage && (
                <>
                  <Divider />
                  <Section title="Property Damage">
                    <div className="space-y-4">
                      {details.damage.rows.map((row, i) => (
                        <div
                          key={i}
                          className="rounded-xl p-4"
                          style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                          }}
                        >
                          <InfoGrid>
                            <Info label="Description" value={row.description} />
                            <Info label="Cost" value={row.cost} />
                          </InfoGrid>
                        </div>
                      ))}

                      <p className="font-bold text-lg">
                        Subtotal:{" "}
                        {details.currency === "USD"
                          ? "$"
                          : details.currency === "EUR"
                          ? "€"
                          : "R"}{" "}
                        {details.damage.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </Section>
                </>
              )}

              {/* PRODUCT LOSS */}
              {details.productLoss && (
                <>
                  <Divider />
                  <Section title="Product Loss">
                    <div className="space-y-4">
                      {details.productLoss.rows.map((row, i) => (
                        <div
                          key={i}
                          className="rounded-xl p-4"
                          style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                          }}
                        >
                          <InfoGrid>
                            <Info label="Description" value={row.description} />
                            <Info label="Quantity" value={row.quantity} />
                            <Info label="Cost" value={row.cost} />
                          </InfoGrid>
                        </div>
                      ))}

                      <p className="font-bold text-lg">
                        Subtotal:{" "}
                        {details.currency === "USD"
                          ? "$"
                          : details.currency === "EUR"
                          ? "€"
                          : "R"}{" "}
                        {details.productLoss.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </Section>
                </>
              )}

              {/* ENVIRONMENTAL IMPACT */}
              {details.environmentalImpact && (
                <>
                  <Divider />
                  <Section title="Environmental Impact">
                    <div className="space-y-4">
                      {details.environmentalImpact.rows.map((row, i) => (
                        <div
                          key={i}
                          className="rounded-xl p-4"
                          style={{
                            background: "var(--card-bg)",
                            border: "1px solid var(--card-border)",
                          }}
                        >
                          <InfoGrid>
                            <Info label="Description" value={row.description} />
                            <Info label="Item Affected" value={row.itemAffected} />
                            <Info label="Cost" value={row.cost} />
                          </InfoGrid>
                        </div>
                      ))}

                      <p className="font-bold text-lg">
                        Subtotal:{" "}
                        {details.currency === "USD"
                          ? "$"
                          : details.currency === "EUR"
                          ? "€"
                          : "R"}{" "}
                        {details.environmentalImpact.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </Section>
                </>
              )}

              {/* GRAND TOTAL */}
              <Divider />
              <Section title="Grand Total">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                  {details.currency === "USD"
                    ? "$"
                    : details.currency === "EUR"
                    ? "€"
                    : "R"}{" "}
                  {details.grandTotal.toFixed(2)}
                </h2>
              </Section>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   REUSABLE COMPONENTS
------------------------------------------------------- */

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div
      className="my-6"
      style={{ borderBottom: "1px solid var(--card-border)" }}
    />
  );
}

function InfoGrid({ children }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Info({ label, value, bigLabel = false }) {
  const formatted = label
    .toString()
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase());

  return (
    <div>
      <div
        className={
          bigLabel
            ? "text-base font-bold"
            : "text-xs uppercase tracking-wide opacity-70"
        }
      >
        {formatted}
      </div>

      <div className="text-sm">{value || "N/A"}</div>
    </div>
  );
}

function PillList({ items }) {
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

function Badge({ children }) {
  return (
    <span
      className="px-4 py-1 rounded-full text-sm font-semibold"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
      }}
    >
      {children}
    </span>
  );
}
