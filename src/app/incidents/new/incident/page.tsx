"use client";

import React, { useState } from "react";

/* -------------------------------------------------------
   OPTION ARRAYS (from official DS.009.05.06 document)
------------------------------------------------------- */

const INCIDENT_TYPES = [
  "First Aid Case",
  "Hijacking",
  "Minor Medical",
  "Disabling",
  "Reportable Section 24",
  "Property Damage or Loss",
  "Environmental Incident",
];

const BODY_PARTS = [
  "Eye", "Face", "Head", "Ear", "Mouth", "Neck",
  "Shoulder", "Back", "Chest", "Trunk", "Hip", "Bum",
  "Arm", "Wrist", "Hand", "Fingers", "Leg", "Knee",
  "Ankle", "Foot", "Toes", "Lungs", "Kidney", "Other",
];

const EFFECTS = [
  "Contusion", "Sprain", "Strain", "Amputation", "Fracture",
  "Cut", "Poisoned", "Burn", "Shock", "Irritation",
  "Inhalation", "Decease",
];

const HAZARDS = [
  "Struck By", "Caught In Between", "Material Handling", "Transport",
  "Falling Object", "Electrical Contact", "Contact With Warm Material",
  "No Lock Outs", "Struck Against", "Fall", "Moving Machines", "Fire",
  "Handling Equipment", "Explosion", "Poor Maintenance", "Fumes",
  "Vapours", "Vibration", "Noise", "Bacteria", "Fungicides",
  "Personal Hygiene", "Dust", "Gas", "Ergonomics", "Glare",
  "Contact With Chemical", "Water Pollution", "Ground Pollution",
  "Air Pollution", "Spills", "Waste Contamination",
  "Other (Environmental)",
];

const ROOT_CAUSES_HUMAN = [
  "Operating without authority", "Operating at unsafe speed",
  "Making safety devices inoperative", "Using unsafe tools or equipment",
  "Using equipment unsafely", "Unsafe loading / placing / mixing",
  "Taking unsafe position", "Working on moving/unsafe equipment",
  "Distracting / teasing / horseplay",
  "Failure to use protective equipment",
  "Safety regulations or instructions ignored", "Abuse or misuse",
  "Not following work instruction", "Lack of knowledge or skill",
  "Physical or emotional problems", "Improper attitude or motivation",
  "Tired / stressed / discomfort", "Pre-existing medical conditions",
];

const ROOT_CAUSES_PHYSICAL = [
  "Inadequately guarded", "Unguarded",
  "Defective tools, equipment, substance", "Hazardous arrangement",
  "Unsafe design or construction", "Poor lighting", "Unsafe clothing",
  "Poor floor condition", "Poor ventilation", "Heat or cold stress factor",
  "Poor outlay of environment", "Inadequate quantity of waste containers",
  "Overcrowded due to over stock or over production",
  "Mechanical failure", "Wear and tear",
];

const ROOT_CAUSES_JOB = [
  "Inadequate work standards", "Poor factory layout", "No PPE provided",
  "No purchasing standards", "Inadequate engineering control",
  "Inadequate waste control", "Inadequate training",
  "No security standard", "No inspection control",
  "Inadequate pre commissioning",
];

const CORRECTIVE_PERSONAL = [
  "Instruct / warn how to perform task correctly",
  "Revise SWP training with injured",
  "Improve compliance to standards",
  "Motivate",
  "Create awareness programs",
  "Post warnings & disciplinary actions",
  "Send for external training",
  "Have medically examined",
];

const CORRECTIVE_JOB = [
  "Improve housekeeping or factory lay-out",
  "Improve space",
  "Write or revise safe work instructions",
  "Install guard or safety devices",
  "Introduce modification / engineering control",
  "Provide controls for spillages",
  "Revise waste management",
  "Implement inspection registers",
  "Provide protection through PPE or other",
  "Provide correct tools or equipment for the job",
];

/* -------------------------------------------------------
   COLLAPSE ANIMATION
------------------------------------------------------- */

const collapseAnimation = {
  open: "opacity-100 scale-100 max-h-[2000px] pt-0 pb-2",
  closed: "opacity-0 scale-[0.98] max-h-0 pt-0 pb-2 overflow-hidden",
  transition: "transition-all duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)]",
};

/* -------------------------------------------------------
   PILL TOGGLE
------------------------------------------------------- */

const PillToggle = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full border text-xs font-medium transition
      ${
        active
          ? "bg-emerald-500/90 text-black border-emerald-400 shadow-md shadow-emerald-500/30"
          : "bg-white/10 border-white/30 hover:bg-white/20"
      }
    `}
  >
    {label}
  </button>
);

/* -------------------------------------------------------
   SECTION CARD
------------------------------------------------------- */

const SectionCard = ({ title, open, onToggle, children }) => (
  <div
    className="mt-6 backdrop-blur-xl rounded-2xl shadow-xl"
    style={{
      background: "var(--card-bg)",
      border: "1px solid var(--card-border)",
    }}
  >
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 text-left"
    >
      <h2 className="text-base font-semibold">{title}</h2>
      <span
        className={`transition-transform duration-300 ${
          open ? "rotate-180" : "rotate-0"
        }`}
      >
        ▼
      </span>
    </button>

    <div
      className={`${collapseAnimation.transition} ${
        open ? collapseAnimation.open : collapseAnimation.closed
      } px-5`}
    >
      {children}
    </div>
  </div>
);

/* -------------------------------------------------------
   MAIN FORM
------------------------------------------------------- */

export default function NewIncidentFormPage() {
  const [title, setTitle] = useState("");
  const [incidentType, setIncidentType] = useState<string[]>([]);
  const [department, setDepartment] = useState("");
  const [employee, setEmployee] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [description, setDescription] = useState("");

  const [injuredPerson, setInjuredPerson] = useState({
    name: "",
    surname: "",
    idNumber: "",
    employeeNumber: "",
    occupation: "",
    department: "",
    supervisor: "",
    contactNumber: "",
    address: "",
  });

  const [openBasic, setOpenBasic] = useState(true);
  const [openTypes, setOpenTypes] = useState(true);
  const [openInjured, setOpenInjured] = useState(true);
  const [openBodyParts, setOpenBodyParts] = useState(true);
  const [openEffects, setOpenEffects] = useState(true);
  const [openNature, setOpenNature] = useState(true);
  const [openHazards, setOpenHazards] = useState(true);
  const [openRootHuman, setOpenRootHuman] = useState(true);
  const [openRootPhysical, setOpenRootPhysical] = useState(true);
  const [openRootJob, setOpenRootJob] = useState(true);
  const [openCorrectivePersonal, setOpenCorrectivePersonal] = useState(true);
  const [openCorrectiveJob, setOpenCorrectiveJob] = useState(true);
  const [openCorrectiveNotes, setOpenCorrectiveNotes] = useState(true);
  const [openNarrative, setOpenNarrative] = useState(true);
  const [openPhotos, setOpenPhotos] = useState(true);

  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [effects, setEffects] = useState<string[]>([]);
  const [natureOfInjury, setNatureOfInjury] = useState("");
  const [hazards, setHazards] = useState<string[]>([]);
  const [rootCausesHuman, setRootCausesHuman] = useState<string[]>([]);
  const [rootCausesPhysical, setRootCausesPhysical] = useState<string[]>([]);
  const [rootCausesJob, setRootCausesJob] = useState<string[]>([]);
  const [correctivePersonal, setCorrectivePersonal] = useState<string[]>([]);
  const [correctiveJob, setCorrectiveJob] = useState<string[]>([]);
  const [correctiveNotes, setCorrectiveNotes] = useState("");
  const [narrative, setNarrative] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const [saving, setSaving] = useState(false);

  const toggle = (value: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  /* -------------------------------------------------------
     SUBMIT HANDLER — IMAGE SAVING LOGIC
  ------------------------------------------------------- */

  async function handleSubmit() {
    if (!title || !date) {
      alert("Please provide at least a title and date.");
      return;
    }

    setSaving(true);

    try {
      const details = {
        basic: { incidentTypes: incidentType },
        injuredPerson,
        injuryBodyParts: bodyParts,
        injuryEffects: effects,
        injuryNature: natureOfInjury ? [natureOfInjury] : [],
        hazards,
        rootCauses: [
          ...rootCausesHuman,
          ...rootCausesPhysical,
          ...rootCausesJob,
        ],
        correctiveActions: [...correctivePersonal, ...correctiveJob],
        correctiveNotes,
        narrative,
      };

      const payload = {
        title,
        type: "incident",
        description: description || null,
        department: department || null,
        employee: employee || null,
        employeeId: employeeId || null,
        location: location || null,
        date,
        severity,
        status: "draft",
        details: JSON.stringify(details),
      };

      // 1. Create incident
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Failed to save incident.");
        setSaving(false);
        return;
      }

      const incident = await res.json();

      // 2. Upload images to Cloudinary
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((file) => formData.append("images", file));

        const uploadRes = await fetch(
          `/api/incidents/${incident.id}/upload-images`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          console.error("UPLOAD ERROR:", await uploadRes.text());
          alert("Incident saved, but image upload failed.");
        } else {
          const uploadJson = await uploadRes.json();

          // 3. Save URLs into Prisma via dedicated /images route
          await fetch(`/api/incidents/${incident.id}/images`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: uploadJson.urls }),
          });
        }
      }

      window.location.href = `/incidents`;
    } catch (e) {
      console.error(e);
      alert("Unexpected error while saving incident.");
      setSaving(false);
    }
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div
          className="backdrop-blur-xl rounded-2xl shadow-xl p-6"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h1 className="text-2xl font-semibold mb-1">
            New Internal Incident / Accident Investigation
          </h1>
          <p className="text-xs">
            Internal Incident or Accident Investigation Report
          </p>
        </div>

        {/* BASIC INFO */}
        <SectionCard
          title="Basic Incident Information"
          open={openBasic}
          onToggle={() => setOpenBasic(!openBasic)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1">
                Incident / Accident Title
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short description of the incident"
              />
            </div>

            <div>
              <label className="block text-xs mb-1">
                Date & Time of Incident
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs mb-1">
                Department Where Incident Occurred
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs mb-1">
                Exact Location
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs mb-1">
                Person Involved (Name & Surname)
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs mb-1">
                Clock / Employee Number
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs mb-1">
                Severity
              </label>
              <select
                className="w-full px-3 py-2 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option>Low</option>
                <option>Moderate</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1">
                Short Description
              </label>
              <input
                className="w-full px-3 py-2 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </SectionCard>

        {/* INCIDENT TYPES */}
        <SectionCard
          title="Incident / Accident Type"
          open={openTypes}
          onToggle={() => setOpenTypes(!openTypes)}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {INCIDENT_TYPES.map((t) => (
              <PillToggle
                key={t}
                label={t}
                active={incidentType.includes(t)}
                onClick={() => toggle(t, incidentType, setIncidentType)}
              />
            ))}
          </div>
        </SectionCard>

        {/* INJURED PERSON */}
        <SectionCard
          title="Injured Person Details"
          open={openInjured}
          onToggle={() => setOpenInjured(!openInjured)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(injuredPerson).map((key) => (
              <div key={key}>
                <label className="block text-xs mb-1 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                <input
                                    className="w-full px-3 py-2 rounded-lg border text-sm
                  focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={(injuredPerson as any)[key]}
                  onChange={(e) =>
                    setInjuredPerson({
                      ...injuredPerson,
                      [key]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* SECTION 4 — BODY PARTS AFFECTED */}
        <SectionCard
          title="Part of Body Affected"
          open={openBodyParts}
          onToggle={() => setOpenBodyParts(!openBodyParts)}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {BODY_PARTS.map((p) => (
              <PillToggle
                key={p}
                label={p}
                active={bodyParts.includes(p)}
                onClick={() => toggle(p, bodyParts, setBodyParts)}
              />
            ))}
          </div>
        </SectionCard>

        {/* SECTION 5 — EFFECT ON PERSON */}
        <SectionCard
          title="Effect on Person"
          open={openEffects}
          onToggle={() => setOpenEffects(!openEffects)}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {EFFECTS.map((e) => (
              <PillToggle
                key={e}
                label={e}
                active={effects.includes(e)}
                onClick={() => toggle(e, effects, setEffects)}
              />
            ))}
          </div>
        </SectionCard>

        {/* SECTION 6 — NATURE OF INJURY */}
        <SectionCard
          title="Nature of Injury (Describe the injury)"
          open={openNature}
          onToggle={() => setOpenNature(!openNature)}
        >
          <textarea
            className="w-full px-3 py-2 rounded-lg border text-sm
            focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
            value={natureOfInjury}
            onChange={(e) => setNatureOfInjury(e.target.value)}
          />
        </SectionCard>

        {/* SECTION 7 — HAZARDS */}
        <SectionCard
          title="Health, Hygiene & Environmental Agents (Hazards)"
          open={openHazards}
          onToggle={() => setOpenHazards(!openHazards)}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {HAZARDS.map((h) => (
              <PillToggle
                key={h}
                label={h}
                active={hazards.includes(h)}
                onClick={() => toggle(h, hazards, setHazards)}
              />
            ))}
          </div>
        </SectionCard>

        {/* SECTION 8 — ROOT CAUSES (HUMAN) */}
        <SectionCard
          title="Root Causes – Human / Personal Factors"
          open={openRootHuman}
          onToggle={() => setOpenRootHuman(!openRootHuman)}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {ROOT_CAUSES_HUMAN.map((r) => (
              <PillToggle
                key={r}
                label={r}
                active={rootCausesHuman.includes(r)}
                onClick={() => toggle(r, rootCausesHuman, setRootCausesHuman)}
              />
            ))}
          </div>
        </SectionCard>

        {/* SECTION 9 — ROOT CAUSES (PHYSICAL) */}
        <SectionCard
          title="Root Causes – Physical Conditions"
          open={openRootPhysical}
          onToggle={() => setOpenRootPhysical(!openRootPhysical)}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {ROOT_CAUSES_PHYSICAL.map((r) => (
              <PillToggle
                key={r}
                label={r}
                active={rootCausesPhysical.includes(r)}
                onClick={() =>
                  toggle(r, rootCausesPhysical, setRootCausesPhysical)
                }
              />
            ))}
          </div>
        </SectionCard>

        {/* SECTION 10 — ROOT CAUSES (JOB) */}
        <SectionCard
          title="Root Causes – Job Factors"
          open={openRootJob}
          onToggle={() => setOpenRootJob(!openRootJob)}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {ROOT_CAUSES_JOB.map((r) => (
              <PillToggle
                key={r}
                label={r}
                active={rootCausesJob.includes(r)}
                onClick={() => toggle(r, rootCausesJob, setRootCausesJob)}
              />
            ))}
          </div>
        </SectionCard>

        {/* SECTION 11 — CORRECTIVE ACTIONS (PERSONAL) */}
        <SectionCard
          title="Corrective Actions – Personal Action"
          open={openCorrectivePersonal}
          onToggle={() =>
            setOpenCorrectivePersonal(!openCorrectivePersonal)
          }
        >
          <div className="flex flex-wrap justify-center gap-3">
            {CORRECTIVE_PERSONAL.map((c) => (
              <PillToggle
                key={c}
                label={c}
                active={correctivePersonal.includes(c)}
                onClick={() =>
                  toggle(c, correctivePersonal, setCorrectivePersonal)
                }
              />
            ))}
          </div>
        </SectionCard>

        {/* SECTION 12 — CORRECTIVE ACTIONS (JOB) */}
        <SectionCard
          title="Corrective Actions – Improve Conditions / Job Related"
          open={openCorrectiveJob}
          onToggle={() => setOpenCorrectiveJob(!openCorrectiveJob)}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {CORRECTIVE_JOB.map((c) => (
              <PillToggle
                key={c}
                label={c}
                active={correctiveJob.includes(c)}
                onClick={() => toggle(c, correctiveJob, setCorrectiveJob)}
              />
            ))}
          </div>
        </SectionCard>

        {/* SECTION 13 — CORRECTIVE NOTES */}
        <SectionCard
          title="Corrective Notes"
          open={openCorrectiveNotes}
          onToggle={() => setOpenCorrectiveNotes(!openCorrectiveNotes)}
        >
          <textarea
            className="w-full px-3 py-2 rounded-lg border text-sm
            focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
            value={correctiveNotes}
            onChange={(e) => setCorrectiveNotes(e.target.value)}
          />
        </SectionCard>

        {/* SECTION 14 — INCIDENT NARRATIVE */}
        <SectionCard
          title="Detailed Description of the Incident / Accident"
          open={openNarrative}
          onToggle={() => setOpenNarrative(!openNarrative)}
        >
          <textarea
            className="w-full px-3 py-2 rounded-lg border text-sm
            focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[150px]"
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
          />
        </SectionCard>

        {/* SECTION 15 — PHOTOS */}
        <SectionCard
          title="Photos & Sequence of Events"
          open={openPhotos}
          onToggle={() => setOpenPhotos(!openPhotos)}
        >
          <input
            type="file"
            multiple
            onChange={handleImageUpload}
            className="block w-full text-sm
            file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
            file:text-xs file:font-semibold file:bg-emerald-600 file:text-white
            hover:file:bg-emerald-700"
          />

          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {images.map((file, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden border"
                  style={{
                    background: "rgba(0,0,0,0.1)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== idx))
                    }
                    className="absolute top-2 right-2 bg-red-600 text-white text-xs w-6 h-6
                    rounded-full flex items-center justify-center shadow-md hover:bg-red-700"
                  >
                    ✕
                  </button>

                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${idx + 1}`}
                    className="w-full h-40 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* SAVE BUTTON */}
        <div className="mt-10">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700
            text-white text-sm font-semibold shadow-md transition disabled:opacity-60"
          >
            {saving ? "Saving Incident..." : "Save Incident"}
          </button>
        </div>
      </div>
    </div>
  );
}


