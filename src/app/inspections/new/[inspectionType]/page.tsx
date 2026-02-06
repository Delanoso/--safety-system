import { redirect } from "next/navigation";
import { use } from "react";

// Updated frequency detection based on your new lists
function getFrequency(type: string): "daily" | "weekly" | "monthly" {
  const daily = [
    "Truck Mounted Crane",
    "Pre-Operation Checklist: Forklift",
    "Pre-Operation Checklist: Horse and Trailer",
    "Pre-Operation Checklist: Horse and Trailer with Taillift",
    "Pre-Operation Checklist: Ridged",
    "Pre-Operation Checklist: Ridged with Crane",
    "Pre-Operation Checklist: Ridged with Taillift",
    "Pre-Operation Checklist: Floor Scrubber",
    "Vehicle Spot Check Inspection",
    "PPE Inspection",
    "Scaffolding (If In Use)",
  ];

  const weekly = [
    "Fire Hose Reels",
    "Fire Hydrants",
    "Emergency Lighting",
    "Assembly Points",
    "Alarm Systems Test",
    "Air Compressors (Basic Check)",
    "Generators (Weekly Run Test)",
    "Safety Harnesses",
    "Sling Inspection",
    "Chains, Hooks & Shackles Inspection",
    "Emergency Exit Inspections",
    "Waste Management Areas",
    "Racking Inspections (Weekly)",
  ];

  if (daily.includes(type)) return "daily";
  if (weekly.includes(type)) return "weekly";
  return "monthly";
}

export default function RouterPage({
  params,
}: {
  params: Promise<{ inspectionType: string }>;
}) {
  const resolved = use(params);
  const inspectionType = decodeURIComponent(resolved.inspectionType);

  const frequency = getFrequency(inspectionType);

  if (frequency === "daily") {
    redirect(`/inspections/new/daily/${inspectionType}`);
  }

  if (frequency === "weekly") {
    redirect(`/inspections/new/weekly/${inspectionType}`);
  }

  redirect(`/inspections/new/monthly/${inspectionType}`);
}

