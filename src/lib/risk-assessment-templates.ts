import type { RiskHazardRow, RiskLevel } from "@/lib/risk-assessment";

export const INDUSTRY_SECTORS = [
  "Manufacturing",
  "Construction",
  "Healthcare",
  "Retail",
  "Office / Administration",
  "Warehouse & Logistics",
  "Hospitality",
  "Agriculture",
  "Mining & Quarrying",
  "Oil & Gas",
  "Other",
] as const;

export const ASSESSMENT_TYPES = [
  "General Risk Assessment",
  "Task-based Risk Assessment",
  "COSHH (Hazardous Substances)",
  "Fire Risk Assessment",
  "Manual Handling",
  "Work at Height",
  "Contractor Risk Assessment",
  "Office Risk Assessment",
  "Machinery Risk Assessment",
  "Other",
] as const;

export type IndustrySector = (typeof INDUSTRY_SECTORS)[number];
export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];

export type HazardTemplate = {
  hazard: string;
  whoAtRisk: string;
  riskBefore: RiskLevel;
  controlMeasures: string;
  riskAfter: RiskLevel;
};

export type AssessmentTemplatePack = {
  title: string;
  departmentHint?: string;
  locationHint?: string;
  ppeRequired: string;
  hazards: HazardTemplate[];
};

/** Core hazard sets per assessment type (Salus rule library). */
const BY_ASSESSMENT_TYPE: Record<string, AssessmentTemplatePack> = {
  "General Risk Assessment": {
    title: "General workplace risk assessment",
    ppeRequired: "Safety boots, hi-vis vest where required, gloves for manual tasks",
    hazards: [
      {
        hazard: "Slips, trips and falls on same level",
        whoAtRisk: "All employees and visitors",
        riskBefore: "Medium",
        controlMeasures:
          "Keep walkways clear, immediate spill cleanup, adequate lighting, non-slip footwear policy, regular housekeeping inspections",
        riskAfter: "Low",
      },
      {
        hazard: "Struck by moving vehicles or mobile plant",
        whoAtRisk: "Pedestrians, drivers, operators",
        riskBefore: "High",
        controlMeasures:
          "Segregated pedestrian routes, speed limits, trained drivers, reversing alarms, banksman where needed",
        riskAfter: "Medium",
      },
      {
        hazard: "Contact with moving machinery",
        whoAtRisk: "Operators, maintenance staff",
        riskBefore: "High",
        controlMeasures:
          "Guarding in place, lock-out/tag-out for maintenance, authorised operators only, pre-use checks",
        riskAfter: "Medium",
      },
      {
        hazard: "Manual handling injuries",
        whoAtRisk: "Employees handling materials",
        riskBefore: "Medium",
        controlMeasures:
          "Mechanical aids where practicable, team lifts for heavy loads, manual handling training, job rotation",
        riskAfter: "Low",
      },
    ],
  },
  "Task-based Risk Assessment": {
    title: "Task-based risk assessment",
    ppeRequired: "Task-specific PPE as identified below",
    hazards: [
      {
        hazard: "Unplanned task steps or poor work method",
        whoAtRisk: "Persons performing the task",
        riskBefore: "Medium",
        controlMeasures:
          "Written safe work procedure, brief tool-box talk before task, supervisor sign-off for non-routine work",
        riskAfter: "Low",
      },
      {
        hazard: "Inadequate tools or equipment for the task",
        whoAtRisk: "Operatives",
        riskBefore: "Medium",
        controlMeasures:
          "Correct tool selection, pre-use inspection, maintenance schedule, replace defective equipment",
        riskAfter: "Low",
      },
      {
        hazard: "Interaction with other activities in the area",
        whoAtRisk: "Task team and nearby workers",
        riskBefore: "Medium",
        controlMeasures:
          "Permit-to-work where required, area cordoning, communication with adjacent teams",
        riskAfter: "Low",
      },
    ],
  },
  "COSHH (Hazardous Substances)": {
    title: "COSHH risk assessment",
    departmentHint: "Operations / stores",
    ppeRequired: "Chemical-resistant gloves, safety goggles, apron or coveralls, respiratory protection per SDS",
    hazards: [
      {
        hazard: "Skin or eye contact with hazardous substances",
        whoAtRisk: "Handlers, cleaners, maintenance",
        riskBefore: "High",
        controlMeasures:
          "SDS available on site, COSHH register, labelled containers, eyewash station, spill kit, trained handlers",
        riskAfter: "Medium",
      },
      {
        hazard: "Inhalation of vapours, dust or fumes",
        whoAtRisk: "All persons in work area",
        riskBefore: "High",
        controlMeasures:
          "Ventilation or extraction, RPE fit-tested to SDS, monitor exposure where required, minimise quantities stored",
        riskAfter: "Medium",
      },
      {
        hazard: "Fire or reaction from incompatible chemicals",
        whoAtRisk: "Store personnel, emergency responders",
        riskBefore: "Critical",
        controlMeasures:
          "Segregated storage, flammable cupboard where needed, no smoking, fire extinguishers suitable for class of fire",
        riskAfter: "Medium",
      },
    ],
  },
  "Fire Risk Assessment": {
    title: "Fire risk assessment",
    ppeRequired: "None for routine work; fire wardens trained in evacuation procedures",
    hazards: [
      {
        hazard: "Ignition sources near combustible materials",
        whoAtRisk: "All occupants",
        riskBefore: "High",
        controlMeasures:
          "Housekeeping, hot work permit, designated smoking areas away from storage, electrical PAT testing",
        riskAfter: "Medium",
      },
      {
        hazard: "Blocked or inadequate escape routes",
        whoAtRisk: "All occupants",
        riskBefore: "Critical",
        controlMeasures:
          "Clear exits, illuminated signage, fire doors not wedged open, regular fire drills, assembly point marked",
        riskAfter: "Low",
      },
      {
        hazard: "Insufficient or unmaintained fire-fighting equipment",
        whoAtRisk: "All occupants",
        riskBefore: "High",
        controlMeasures:
          "Serviced extinguishers, trained fire wardens, alarm tested, evacuation plan displayed",
        riskAfter: "Low",
      },
    ],
  },
  "Manual Handling": {
    title: "Manual handling risk assessment",
    ppeRequired: "Safety boots, gloves; back support belt only if recommended after assessment",
    hazards: [
      {
        hazard: "Lifting, carrying or pushing loads beyond individual capability",
        whoAtRisk: "Employees performing manual handling",
        riskBefore: "High",
        controlMeasures:
          "TILE assessment (Task, Individual, Load, Environment), mechanical aids, team lifts, weight limits posted",
        riskAfter: "Medium",
      },
      {
        hazard: "Awkward postures or repetitive handling",
        whoAtRisk: "Operators, pickers, packers",
        riskBefore: "Medium",
        controlMeasures:
          "Adjust work height, job rotation, micro-breaks, ergonomic training",
        riskAfter: "Low",
      },
      {
        hazard: "Poor flooring or obstructed routes while carrying loads",
        whoAtRisk: "Handlers, pedestrians nearby",
        riskBefore: "Medium",
        controlMeasures:
          "Clear routes, even surfaces, adequate lighting, two-person carry for long distances",
        riskAfter: "Low",
      },
    ],
  },
  "Work at Height": {
    title: "Work at height risk assessment",
    ppeRequired: "Safety harness and lanyard where fall arrest required, hard hat, non-slip footwear",
    hazards: [
      {
        hazard: "Falls from ladders, platforms or roofs",
        whoAtRisk: "Persons working at height, persons below",
        riskBefore: "Critical",
        controlMeasures:
          "Avoid work at height where possible, use MEWPs or scaffolding, harness anchor points, exclusion zone below",
        riskAfter: "Medium",
      },
      {
        hazard: "Falling objects onto persons below",
        whoAtRisk: "Ground personnel, public",
        riskBefore: "High",
        controlMeasures:
          "Tool tethering, toe boards on platforms, hard hat zone, barriers and signage",
        riskAfter: "Medium",
      },
      {
        hazard: "Unstable access equipment",
        whoAtRisk: "Users of ladders and mobile towers",
        riskBefore: "High",
        controlMeasures:
          "Inspect before use, trained erectors, level ground, 3-point contact on ladders, tag-out defective equipment",
        riskAfter: "Low",
      },
    ],
  },
  "Contractor Risk Assessment": {
    title: "Contractor risk assessment",
    departmentHint: "Contractor management",
    ppeRequired: "Contractor minimum site PPE: hard hat, boots, hi-vis, task-specific additions",
    hazards: [
      {
        hazard: "Inadequate contractor induction or unfamiliarity with site rules",
        whoAtRisk: "Contractor personnel, employees",
        riskBefore: "High",
        controlMeasures:
          "Site induction before work, permit-to-work, escorted access where required, competency checks",
        riskAfter: "Medium",
      },
      {
        hazard: "Simultaneous operations (SIMOPS) conflicts",
        whoAtRisk: "Contractors and employees",
        riskBefore: "High",
        controlMeasures:
          "Coordinated work plan, daily coordination meeting, segregated work areas",
        riskAfter: "Medium",
      },
      {
        hazard: "Substandard contractor equipment or documentation",
        whoAtRisk: "All site occupants",
        riskBefore: "Medium",
        controlMeasures:
          "Review safety file, insurance, method statements, inspect equipment on arrival",
        riskAfter: "Low",
      },
    ],
  },
  "Office Risk Assessment": {
    title: "Office risk assessment",
    departmentHint: "Administration",
    locationHint: "Office areas",
    ppeRequired: "Minimal; display screen equipment breaks as per ergonomics assessment",
    hazards: [
      {
        hazard: "Display screen equipment (DSE) — eye strain, musculoskeletal discomfort",
        whoAtRisk: "Office workers",
        riskBefore: "Medium",
        controlMeasures:
          "Adjustable chairs and screens, DSE assessments, breaks every hour, footrests where needed",
        riskAfter: "Low",
      },
      {
        hazard: "Trailing cables and trip hazards",
        whoAtRisk: "Staff and visitors",
        riskBefore: "Medium",
        controlMeasures:
          "Cable management, clear walkways, report defects, adequate lighting on stairs",
        riskAfter: "Low",
      },
      {
        hazard: "Stress and workload pressure",
        whoAtRisk: "Employees",
        riskBefore: "Medium",
        controlMeasures:
          "Supervision, manageable workloads, reporting channels, wellness resources",
        riskAfter: "Low",
      },
    ],
  },
  "Machinery Risk Assessment": {
    title: "Machinery risk assessment",
    departmentHint: "Production / maintenance",
    ppeRequired: "Safety boots, hearing protection, gloves (non-loose), eye protection, lock-out devices",
    hazards: [
      {
        hazard: "Contact with dangerous parts during operation",
        whoAtRisk: "Operators, cleaners",
        riskBefore: "Critical",
        controlMeasures:
          "Fixed and interlocked guards, emergency stops, authorised operators, no loose clothing/jewellery",
        riskAfter: "Medium",
      },
      {
        hazard: "Maintenance without isolation of energy sources",
        whoAtRisk: "Maintenance fitters",
        riskBefore: "Critical",
        controlMeasures:
          "Lock-out/tag-out procedure, isolation points labelled, permit-to-work, test before work",
        riskAfter: "Low",
      },
      {
        hazard: "Noise exposure during operation",
        whoAtRisk: "Operators and nearby staff",
        riskBefore: "Medium",
        controlMeasures:
          "Engineering controls where possible, hearing protection zones, audiometry if required",
        riskAfter: "Low",
      },
    ],
  },
  Other: {
    title: "Workplace risk assessment",
    ppeRequired: "As identified per hazard below",
    hazards: [
      {
        hazard: "General workplace hazards",
        whoAtRisk: "Employees and visitors",
        riskBefore: "Medium",
        controlMeasures:
          "Site rules communicated, supervision, report hazards, emergency procedures in place",
        riskAfter: "Low",
      },
    ],
  },
};

/** Extra hazards added when industry matches (merged with base). */
const BY_INDUSTRY: Record<string, HazardTemplate[]> = {
  Manufacturing: [
    {
      hazard: "Production line entanglement or nip points",
      whoAtRisk: "Machine operators",
      riskBefore: "High",
      controlMeasures:
        "Machine guarding, emergency stops, no bypassing interlocks, training on specific equipment",
      riskAfter: "Medium",
    },
  ],
  Construction: [
    {
      hazard: "Falling materials and site vehicle movements",
      whoAtRisk: "Operatives, visitors",
      riskBefore: "High",
      controlMeasures:
        "Exclusion zones, banksman, hard hats mandatory, site traffic management plan",
      riskAfter: "Medium",
    },
    {
      hazard: "Excavation collapse or underground services",
      whoAtRisk: "Ground workers",
      riskBefore: "Critical",
      controlMeasures:
        "Permit-to-dig, service locates, shoring/trench boxes, competent person supervision",
      riskAfter: "Medium",
    },
  ],
  Healthcare: [
    {
      hazard: "Biological exposure and sharps injuries",
      whoAtRisk: "Clinical and support staff",
      riskBefore: "High",
      controlMeasures:
        "Standard precautions, sharps bins, vaccination programme, spill procedures for bodily fluids",
      riskAfter: "Medium",
    },
  ],
  "Warehouse & Logistics": [
    {
      hazard: "Forklift and pallet truck operations",
      whoAtRisk: "Drivers, pickers, pedestrians",
      riskBefore: "High",
      controlMeasures:
        "Licensed drivers, segregated routes, rack inspections, load stability checks",
      riskAfter: "Medium",
    },
  ],
  Agriculture: [
    {
      hazard: "Tractors, PTO shafts and farm machinery",
      whoAtRisk: "Farm workers",
      riskBefore: "Critical",
      controlMeasures:
        "PTO guards in place, no riding on implements, training, children excluded from work areas",
      riskAfter: "Medium",
    },
  ],
  "Mining & Quarrying": [
    {
      hazard: "Dust, vibration and fly rock from blasting/drilling",
      whoAtRisk: "Miners, drillers",
      riskBefore: "Critical",
      controlMeasures:
        "Blast exclusion zones, dust suppression, RPE, geotechnical assessment of faces",
      riskAfter: "High",
    },
  ],
  "Oil & Gas": [
    {
      hazard: "Flammable atmosphere and pressure systems",
      whoAtRisk: "Process operators",
      riskBefore: "Critical",
      controlMeasures:
        "Hot work permits, gas detection, blow-out prevention, emergency shutdown systems",
      riskAfter: "High",
    },
  ],
};

/** Keyword triggers in free-text description → extra hazards. */
const KEYWORD_HAZARDS: { pattern: RegExp; hazard: HazardTemplate }[] = [
  {
    pattern: /\b(forklift|reach truck|pallet jack)\b/i,
    hazard: {
      hazard: "Forklift and materials handling vehicle operations",
      whoAtRisk: "Drivers and pedestrians",
      riskBefore: "High",
      controlMeasures:
        "Certified operators, pedestrian segregation, horn at intersections, daily checks",
      riskAfter: "Medium",
    },
  },
  {
    pattern: /\b(welding|grinder|grinding|hot work)\b/i,
    hazard: {
      hazard: "Hot work — sparks, fumes, fire",
      whoAtRisk: "Welders, adjacent workers",
      riskBefore: "High",
      controlMeasures:
        "Hot work permit, fire watch, screens, fume extraction, combustibles removed 10 m",
      riskAfter: "Medium",
    },
  },
  {
    pattern: /\b(chemical|solvent|acid|bleach|coshh)\b/i,
    hazard: {
      hazard: "Handling hazardous substances",
      whoAtRisk: "Handlers",
      riskBefore: "High",
      controlMeasures: "SDS reviewed, correct PPE, spill kit, wash facilities",
      riskAfter: "Medium",
    },
  },
  {
    pattern: /\b(height|roof|ladder|scaffold|elevated)\b/i,
    hazard: {
      hazard: "Work at height",
      whoAtRisk: "Persons at height and below",
      riskBefore: "Critical",
      controlMeasures: "Fall prevention hierarchy, harness where needed, exclusion zone",
      riskAfter: "Medium",
    },
  },
  {
    pattern: /\b(electrical|panel|isolat|lockout|loto)\b/i,
    hazard: {
      hazard: "Electrical energy during maintenance",
      whoAtRisk: "Electricians, maintenance",
      riskBefore: "Critical",
      controlMeasures: "Lock-out/tag-out, prove dead, authorised persons only",
      riskAfter: "Low",
    },
  },
  {
    pattern: /\b(noise|compressor|hammer|drill)\b/i,
    hazard: {
      hazard: "Noise exposure",
      whoAtRisk: "Operators and nearby staff",
      riskBefore: "Medium",
      controlMeasures: "Hearing protection zones, maintenance of equipment, rotation",
      riskAfter: "Low",
    },
  },
];

function templateToRow(t: HazardTemplate): RiskHazardRow {
  return {
    hazard: t.hazard,
    whoAtRisk: t.whoAtRisk,
    riskBefore: t.riskBefore,
    controlMeasures: t.controlMeasures,
    riskAfter: t.riskAfter,
  };
}

function dedupeHazards(rows: RiskHazardRow[]): RiskHazardRow[] {
  const seen = new Set<string>();
  const out: RiskHazardRow[] = [];
  for (const row of rows) {
    const key = row.hazard.toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out.length ? out : rows.slice(0, 1);
}

export function getTemplatePack(
  assessmentType: string,
  industrySector: string
): AssessmentTemplatePack {
  const base =
    BY_ASSESSMENT_TYPE[assessmentType] ?? BY_ASSESSMENT_TYPE["General Risk Assessment"];
  const industryExtras = BY_INDUSTRY[industrySector] ?? [];

  const hazards = dedupeHazards([
    ...base.hazards.map(templateToRow),
    ...industryExtras.map(templateToRow),
  ]);

  return {
    ...base,
    hazards: hazards.map((h) => ({
      hazard: h.hazard,
      whoAtRisk: h.whoAtRisk,
      riskBefore: h.riskBefore as RiskLevel,
      controlMeasures: h.controlMeasures,
      riskAfter: h.riskAfter as RiskLevel,
    })),
  };
}

export function hazardsFromDescription(description: string): HazardTemplate[] {
  if (!description.trim()) return [];
  const found: HazardTemplate[] = [];
  for (const { pattern, hazard } of KEYWORD_HAZARDS) {
    if (pattern.test(description)) found.push(hazard);
  }
  return found;
}

export function buildAssessmentTitle(
  pack: AssessmentTemplatePack,
  assessmentType: string,
  industrySector: string,
  description?: string | null
): string {
  if (description?.trim()) {
    const short = description.trim().slice(0, 60);
    return `${pack.title}: ${short}${description.length > 60 ? "…" : ""}`;
  }
  if (industrySector && industrySector !== "Other") {
    return `${assessmentType} — ${industrySector}`;
  }
  return assessmentType;
}
