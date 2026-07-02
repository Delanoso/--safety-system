"use client";

import React, { useState, useEffect } from "react";
import PersonAutocomplete, { type CompanyPersonRecord } from "@/components/PersonAutocomplete";
import { INCIDENT_TYPES, ACCIDENT_CATEGORIES, BODY_PARTS } from "@/lib/incident-constants";
import TeamInvolvedEditor from "@/components/incident/TeamInvolvedEditor";

/* -------------------------------------------------------
   OPTION ARRAYS (from official DS.009.05.06 document)
------------------------------------------------------- */

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

const ACCIDENT_ROOT_CAUSES_HUMAN = [
  "Distracted",
  "Using Cellphone",
  "Safety devices turned off",
  "Not wearing seatbelt",
  "Fell asleep",
];

function humanRootCauseOptions(isAccident: boolean) {
  return isAccident
    ? [...ROOT_CAUSES_HUMAN, ...ACCIDENT_ROOT_CAUSES_HUMAN]
    : ROOT_CAUSES_HUMAN;
}

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

export default function IncidentFormPage({
  editId,
  variant: variantProp = "incident",
}: {
  editId?: string;
  variant?: "incident" | "accident";
}) {
  type AdditionalPerson = { name: string; employeeId: string };
  const [reportVariant, setReportVariant] = useState<"incident" | "accident">(variantProp);
  const isAccident = reportVariant === "accident";
  const [loadingExisting, setLoadingExisting] = useState(!!editId);
  const [title, setTitle] = useState("");
  const [incidentType, setIncidentType] = useState<string[]>([]);
  const [accidentCategories, setAccidentCategories] = useState<string[]>([]);
  const [hasInjuries, setHasInjuries] = useState(false);
  const [vehicleOrEquipment, setVehicleOrEquipment] = useState("");
  const [registrationOrAssetId, setRegistrationOrAssetId] = useState("");
  const [operatorOrDriver, setOperatorOrDriver] = useState("");
  const [accidentCircumstances, setAccidentCircumstances] = useState("");
  const [department, setDepartment] = useState("");
  const [employee, setEmployee] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [additionalPeople, setAdditionalPeople] = useState<AdditionalPerson[]>([]);
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
  const [openAccidentVehicle, setOpenAccidentVehicle] = useState(true);
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
  const [images, setImages] = useState<File[]>([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/incidents/${editId}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        if (cancelled) return;

        setTitle(data.title || "");
        if (data.type === "accident" || data.type === "incident") {
          setReportVariant(data.type);
        }
        setDepartment(data.department || "");
        setEmployee(data.employee || "");
        setEmployeeId(data.employeeId || "");
        setLocation(data.location || "");
        setDate(data.date ? new Date(data.date).toISOString().slice(0, 16) : "");
        setSeverity(data.severity || "Low");
        setDescription(data.description || "");

        let parsed: Record<string, unknown> = {};
        try {
          parsed = data.details ? JSON.parse(data.details) : {};
        } catch {
          parsed = {};
        }

        const basic = (parsed.basic as {
          incidentTypes?: string[];
          accidentCategories?: string[];
          hasInjuries?: boolean;
          vehicleOrEquipment?: string;
          registrationOrAssetId?: string;
          operatorOrDriver?: string;
          accidentCircumstances?: string;
          additionalPeople?: AdditionalPerson[];
        }) || {};
        setIncidentType(basic.incidentTypes || []);
        setAccidentCategories(basic.accidentCategories || []);
        setHasInjuries(Boolean(basic.hasInjuries));
        setVehicleOrEquipment(basic.vehicleOrEquipment || "");
        setRegistrationOrAssetId(basic.registrationOrAssetId || "");
        setOperatorOrDriver(basic.operatorOrDriver || "");
        setAccidentCircumstances(basic.accidentCircumstances || "");
        const extraPeople = Array.isArray(basic.additionalPeople)
          ? basic.additionalPeople.slice(0, 2)
          : [];
        setAdditionalPeople(
          extraPeople
            .map((p: any) => ({
              name: p?.name || "",
              employeeId: p?.employeeId || "",
            }))
            .filter((p: any) => p.name || p.employeeId)
        );

        const injured = (parsed.injuredPerson as Record<string, string | undefined>) || {};
        setInjuredPerson({
          name: injured.name || "",
          surname: injured.surname || "",
          idNumber: injured.idNumber || "",
          employeeNumber: injured.employeeNumber || "",
          occupation: injured.occupation || "",
          department: injured.department || "",
          supervisor: injured.supervisor || "",
          contactNumber: injured.contactNumber || "",
          address: injured.address || "",
        });

        setBodyParts((parsed.injuryBodyParts as string[]) || []);
        setEffects((parsed.injuryEffects as string[]) || []);
        const nature = parsed.injuryNature as string[] | undefined;
        setNatureOfInjury(nature?.[0] || "");
        setHazards((parsed.hazards as string[]) || []);

        const roots = (parsed.rootCauses as string[]) || [];
        const humanOptions = humanRootCauseOptions(data.type === "accident");
        setRootCausesHuman(roots.filter((r) => humanOptions.includes(r)));
        setRootCausesPhysical(roots.filter((r) => ROOT_CAUSES_PHYSICAL.includes(r)));
        setRootCausesJob(roots.filter((r) => ROOT_CAUSES_JOB.includes(r)));

        const actions = (parsed.correctiveActions as string[]) || [];
        setCorrectivePersonal(actions.filter((a) => CORRECTIVE_PERSONAL.includes(a)));
        setCorrectiveJob(actions.filter((a) => CORRECTIVE_JOB.includes(a)));
        setCorrectiveNotes((parsed.correctiveNotes as string) || "");
      } catch (e) {
        alert(e instanceof Error ? e.message : "Failed to load incident");
      } finally {
        if (!cancelled) setLoadingExisting(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [editId]);

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

  const updateAdditionalPerson = (
    index: number,
    key: keyof AdditionalPerson,
    value: string
  ) => {
    setAdditionalPeople((prev) =>
      prev.map((person, personIndex) =>
        personIndex === index ? { ...person, [key]: value } : person
      )
    );
  };

  const addAdditionalPerson = () => {
    if (additionalPeople.length >= 2) return;
    if (isAccident && !hasInjuries) setHasInjuries(true);
    setAdditionalPeople((prev) => [...prev, { name: "", employeeId: "" }]);
  };

  const removeAdditionalPerson = (index: number) => {
    setAdditionalPeople((prev) => prev.filter((_, i) => i !== index));
  };

  const applyPerson = (person: CompanyPersonRecord) => {
    const fullName = [person.name, person.surname].filter(Boolean).join(" ");
    setEmployee(fullName);
    setEmployeeId(person.employeeNumber ?? "");
    setInjuredPerson({
      name: person.name,
      surname: person.surname ?? "",
      idNumber: person.idNumber ?? "",
      employeeNumber: person.employeeNumber ?? "",
      occupation: person.occupation ?? "",
      department: person.department ?? "",
      supervisor: person.supervisor ?? "",
      contactNumber: person.contactNumber ?? "",
      address: person.address ?? "",
    });
    if (person.department && !department) {
      setDepartment(person.department);
    }
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
      const cleanedAdditionalPeople = additionalPeople
        .map((person) => ({
          name: person.name.trim(),
          employeeId: person.employeeId.trim(),
        }))
        .filter((person) => person.name || person.employeeId);

      const basic = isAccident
        ? {
            accidentCategories,
            hasInjuries,
            vehicleOrEquipment: vehicleOrEquipment || undefined,
            registrationOrAssetId: registrationOrAssetId || undefined,
            operatorOrDriver: operatorOrDriver || undefined,
            accidentCircumstances: accidentCircumstances || undefined,
            additionalPeople: cleanedAdditionalPeople,
          }
        : {
            incidentTypes: incidentType,
            additionalPeople: cleanedAdditionalPeople,
          };

      const details = {
        basic,
        ...(isAccident && !hasInjuries
          ? {}
          : {
              injuredPerson,
              injuryBodyParts: bodyParts,
              injuryEffects: effects,
              injuryNature: natureOfInjury ? [natureOfInjury] : [],
            }),
        hazards,
        rootCauses: [
          ...rootCausesHuman,
          ...rootCausesPhysical,
          ...rootCausesJob,
        ],
        correctiveActions: [...correctivePersonal, ...correctiveJob],
        correctiveNotes,
      };

      const payload = {
        title,
        type: reportVariant,
        description: description || null,
        department: department || null,
        employee: employee || null,
        employeeId: employeeId || null,
        location: location || null,
        date,
        severity,
        status: editId ? undefined : "draft",
        details: JSON.stringify(details),
      };

      if (editId) {
        const res = await fetch(`/api/incidents/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          alert("Failed to save changes.");
          setSaving(false);
          return;
        }
        alert("Incident updated successfully.");
        setSaving(false);
        return;
      }
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
          const errData = await uploadRes.json().catch(() => ({}));
          alert(
            errData.error ||
              "Incident saved, but image upload failed. Check that CLOUDINARY_* vars are set in .env.local."
          );
        } else {
          const uploadJson = await uploadRes.json();

          // 3. Save URLs into Prisma via dedicated /images route
          const saveRes = await fetch(`/api/incidents/${incident.id}/images`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ images: uploadJson.urls }),
          });
          if (!saveRes.ok) {
            const errData = await saveRes.json().catch(() => ({}));
            console.error("Save images error:", errData.error);
          }
        }
      }

      window.location.href = `/incidents/ongoing`;
    } catch (e) {
      console.error(e);
      alert("Unexpected error while saving incident.");
      setSaving(false);
    }
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  if (loadingExisting) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center">
        <p>Loading incident…</p>
      </div>
    );
  }

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
            {editId
              ? isAccident
                ? "Edit Accident Investigation Report"
                : "Edit Incident Investigation Report"
              : isAccident
              ? "New Traffic / Equipment Accident Report"
              : "New Internal Incident / Accident Investigation"}
          </h1>
          <p className="text-xs">
            {editId
              ? "Update report details and add more signatures below."
              : isAccident
              ? "Record traffic or equipment accidents. Injury details are optional."
              : "Internal Incident or Accident Investigation Report"}
          </p>
        </div>

        {/* BASIC INFO */}
        <SectionCard
          title="Basic Incident Information"
          open={openBasic}
          onToggle={() => setOpenBasic(!openBasic)}
        >
          <div className="mb-4">
            <PersonAutocomplete
              label="Search loaded person (name or employee number)"
              onSelect={applyPerson}
            />
          </div>
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
                {isAccident ? "Area of Accident" : "Department Where Incident Occurred"}
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
            {additionalPeople.map((person, index) => (
              <React.Fragment key={`involved-${index}`}>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="block text-xs">
                      Person Involved {index + 2} (Name & Surname)
                    </label>
                    <button
                      type="button"
                      onClick={() => removeAdditionalPerson(index)}
                      className="text-xs font-medium px-2 py-0.5 rounded
                        text-red-300 hover:text-red-200 hover:bg-red-500/20"
                      title="Remove this person"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    className="w-full px-3 py-2 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={person.name}
                    onChange={(e) =>
                      updateAdditionalPerson(index, "name", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1">
                    Clock / Employee Number {index + 2}
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={person.employeeId}
                    onChange={(e) =>
                      updateAdditionalPerson(index, "employeeId", e.target.value)
                    }
                  />
                </div>
              </React.Fragment>
            ))}

            <div className="md:col-span-2 flex items-start">
              <button
                type="button"
                onClick={addAdditionalPerson}
                disabled={additionalPeople.length >= 2}
                className="mt-2 text-sm font-semibold px-4 py-2 rounded-lg border transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                  bg-white/10 border-white/30 hover:bg-white/20"
              >
                + Add another person
              </button>
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

            <div className="md:col-span-2">
              <label className="block text-xs mb-1">
                Description of the incident
              </label>
              <textarea
                className="w-full px-3 py-2 rounded-lg border text-sm
                focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened"
              />
            </div>
          </div>
        </SectionCard>

        {/* INCIDENT TYPES */}
        {!isAccident && (
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
        )}

        {isAccident && (
          <>
            <SectionCard
              title="Accident Category"
              open={openTypes}
              onToggle={() => setOpenTypes(!openTypes)}
            >
              <p className="text-xs opacity-70 mb-4 text-center">
                Select traffic, vehicle, or equipment-related categories.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {ACCIDENT_CATEGORIES.map((t) => (
                  <PillToggle
                    key={t}
                    label={t}
                    active={accidentCategories.includes(t)}
                    onClick={() => toggle(t, accidentCategories, setAccidentCategories)}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Vehicle / Equipment Details"
              open={openAccidentVehicle}
              onToggle={() => setOpenAccidentVehicle(!openAccidentVehicle)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1">
                    Vehicle or Equipment Involved
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border text-sm
                    focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={vehicleOrEquipment}
                    onChange={(e) => setVehicleOrEquipment(e.target.value)}
                    placeholder="e.g. Forklift, Truck, Excavator"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">
                    Registration / Asset Number
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border text-sm
                    focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={registrationOrAssetId}
                    onChange={(e) => setRegistrationOrAssetId(e.target.value)}
                    placeholder="Vehicle reg. or asset ID"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">
                    Driver / Operator
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border text-sm
                    focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={operatorOrDriver}
                    onChange={(e) => setOperatorOrDriver(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs mb-1">
                    Traffic / Equipment Circumstances
                  </label>
                  <textarea
                    className="w-full px-3 py-2 rounded-lg border text-sm
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                    value={accidentCircumstances}
                    onChange={(e) => setAccidentCircumstances(e.target.value)}
                    placeholder="Road conditions, speed, load, machine state, etc."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Injuries"
              open={openInjured}
              onToggle={() => setOpenInjured(!openInjured)}
            >
              <div className="flex flex-wrap justify-center gap-3">
                <PillToggle
                  label="No injuries"
                  active={!hasInjuries}
                  onClick={() => setHasInjuries(false)}
                />
                <PillToggle
                  label="Injuries reported"
                  active={hasInjuries}
                  onClick={() => setHasInjuries(true)}
                />
              </div>
            </SectionCard>
          </>
        )}

        {/* INJURED PERSON */}
        {(!isAccident || hasInjuries) && (
        <SectionCard
          title={isAccident ? "Person Involved" : "Injured Person Details"}
          open={openInjured}
          onToggle={() => setOpenInjured(!openInjured)}
        >
          <div className="mb-4">
            <PersonAutocomplete
              label={
                isAccident
                  ? "Load person involved from company records"
                  : "Load injured person from company records"
              }
              onSelect={applyPerson}
            />
          </div>
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

          {additionalPeople.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-semibold opacity-80">
                {isAccident
                  ? "Additional Persons Involved"
                  : "Additional Injured Persons"}
              </h3>
              {additionalPeople.map((person, index) => (
                <div
                  key={index}
                  className="rounded-xl p-4 flex items-start justify-between gap-4"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  <div className="text-sm min-w-0">
                    <p className="font-semibold mb-1">Person {index + 2}</p>
                    <p className="opacity-80 truncate">
                      {person.name || "No name entered"}
                      {person.employeeId ? ` · ${person.employeeId}` : ""}
                    </p>
                    <p className="text-xs opacity-60 mt-1">
                      Edit name and employee number in Basic Information above.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAdditionalPerson(index)}
                    className="shrink-0 text-xs font-medium px-2 py-1 rounded
                      text-red-300 hover:text-red-200 hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
        )}

        {/* SECTION 4 — BODY PARTS AFFECTED */}
        {(!isAccident || hasInjuries) && (
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
        )}

        {/* SECTION 5 — EFFECT ON PERSON */}
        {(!isAccident || hasInjuries) && (
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
        )}

        {/* SECTION 6 — NATURE OF INJURY */}
        {(!isAccident || hasInjuries) && (
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
        )}

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
            {humanRootCauseOptions(isAccident).map((r) => (
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

        {/* SECTION 14 — PHOTOS */}
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

        {editId && (
          <div className="mt-8">
            <TeamInvolvedEditor
              incidentId={editId}
              incidentTitle={title}
              showCompleteButton={false}
            />
          </div>
        )}

        {/* SAVE BUTTON */}
        <div className="mt-10 flex flex-wrap gap-3">
          {editId && (
            <a href="/incidents/list" className="button button-neutral">
              Back to list
            </a>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700
            text-white text-sm font-semibold shadow-md transition disabled:opacity-60"
          >
            {saving
              ? "Saving…"
              : editId
              ? "Save changes"
              : isAccident
              ? "Save Accident Report"
              : "Save Incident"}
          </button>
        </div>
      </div>
    </div>
  );
}


