"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";

// DAILY INSPECTIONS (Updated)
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
  "Scaffolding (If In Use)", // moved from weekly
];

// WEEKLY INSPECTIONS (Updated)
const weekly = [
  "Fire Hose Reels",
  "Fire Hydrants",
  "Emergency Lighting",
  "Assembly Points",
  "Alarm Systems Test",
  "Air Compressors (Basic Check)",
  "Generators (Weekly Run Test)",
  "Safety Harnesses", // moved from monthly
  "Sling Inspection", // moved from monthly
  "Chains, Hooks & Shackles Inspection", // moved from monthly
  "Emergency Exit Inspections", // moved from monthly
  "Waste Management Areas",
  "Racking Inspections (Weekly)",
];

// MONTHLY INSPECTIONS (Updated)
const monthly = [
  "Buildings & Floors Inspection",
  "Illumination Inspection",
  "Air Conditioner Inspection",
  "Extractor Fan Inspection",
  "Facility Hygiene: Ablutions & Changerooms",
  "Facility Hygiene: Kitchens & Canteens",
  "Staircases",
  "Waste and Refuse Inspection",
  "Pollution Monitoring Inspection",
  "Fire Equipment Inspections",
  "Sprinkler System Inspection",
  "Emergency Alarm System",
  "First Aid Box Inspections",
  "Vehicle First Aid Kit Inspections",
  "Electrical Equipment",
  "Electrical Equipment: Hazardous Locations",
  "Distribution Board Inspection",
  "Monthly Generator Inspection",
  "Machine Guarding Inspection Register",
  "Air Compressor Inspections",
  "Hand Tools Inspection",
  "Mobile Safety Ladder Inspection",
  "Mobile Trolley Inspection",
  "Monthly Spill Kit Inspection",
  "Hydraulic Jacks",
  "Diesel Bowser Inspection",
  "Gate Access and Attendance",
  "Toilets & Hygiene Facilities", // moved from weekly
  "Canteen & Eating Areas", // moved from weekly
  "Storage Rooms", // moved from weekly
];

function Dropdown({ title, items }: { title: string; items: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="
        bg-white/40 dark:bg-white/10 backdrop-blur-xl
        border border-white/20 rounded-2xl shadow-xl
        p-4 transition
      "
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-xl font-semibold">{title}</span>
        {open ? <ChevronDown /> : <ChevronRight />}
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <Link
              key={item}
              href={`/inspections/new/${encodeURIComponent(item)}`}
              className="
                p-3 rounded-xl bg-white/30 dark:bg-white/5
                border border-white/20 hover:bg-white/50 dark:hover:bg-white/10
                transition shadow
              "
            >
              {item}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SelectInspectionType() {
  return (
    <div className="min-h-screen w-full p-10 text-black dark:text-white">
      <h1 className="text-4xl font-bold mb-6">Create New Inspection</h1>
      <p className="text-lg opacity-80 mb-10">
        Choose the type of inspection you want to create.
      </p>

      <div className="flex flex-col gap-6">
        <Dropdown title="Daily Inspections" items={daily} />
        <Dropdown title="Weekly Inspections" items={weekly} />
        <Dropdown title="Monthly Inspections" items={monthly} />
      </div>
    </div>
  );
}

