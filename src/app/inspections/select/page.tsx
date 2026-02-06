"use client";

import { useState } from "react";
import Link from "next/link";

// DAILY INSPECTIONS
const daily = [
  "Housekeeping & Walkways",
  "Fire Extinguishers (Visual Check)",
  "Emergency Exits & Escape Routes",
  "First Aid Box (Visual Check)",
  "PPE Availability & Condition",
  "Spill Kits (Readiness Check)",
  "Hand Tools Condition",
  "Power Tools (Visual Check)",
  "Ladders (Quick Visual Check)",
  "Electrical Cords & Plugs",
  "Forklift Pre-Use Inspection",
  "Workshop Cleanliness",
  "Hazardous Chemical Storage (Visual)",
  "Waste Bins & Segregation",
];

// WEEKLY INSPECTIONS
const weekly = [
  "Fire Hose Reels",
  "Fire Hydrants",
  "Emergency Lighting",
  "Assembly Points",
  "Alarm Systems Test",
  "Air Compressors (Basic Check)",
  "Generators (Weekly Run Test)",
  "Lifting Equipment (Chains, Slings, Hooks)",
  "Scaffolding (If In Use)",
  "Pressure Vessels (Visual)",
  "Toilets & Hygiene Facilities",
  "Canteen & Eating Areas",
  "Storage Rooms",
  "Chemical Stores",
  "Waste Management Areas",
  "Racking Inspections (Weekly)",
];

// MONTHLY INSPECTIONS
const monthly = [
  "Buildings & Floors Inspection",
  "Illumination Inspection",
  "Air Conditioner Inspection",
  "Extractor Fan Inspection",
  "Facility Hygiene: Ablutions & Changerooms",
  "Facility Hygiene: Kitchens & Canteens",
  "Staircases",
  "Emergency Exit Inspections",
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
  "Safety Harnesses",
  "Sling Inspection",
  "Chains, Hooks & Shackles Inspection",
  "Diesel Bowser Inspection",
  "Gate Access and Attendance",
];

export default function InspectionMasterSelector() {
  const [tab, setTab] = useState<"daily" | "weekly" | "monthly">("daily");

  const tabs = {
    daily,
    weekly,
    monthly,
  };

  return (
    <div className="min-h-screen w-full p-10 text-black dark:text-white">
      <h1 className="text-4xl font-bold mb-6">Inspection Types</h1>
      <p className="text-lg opacity-80 mb-10">
        Select a category to view available inspections.
      </p>

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        {["daily", "weekly", "monthly"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`
              px-6 py-2 rounded-xl font-semibold transition
              backdrop-blur-xl border
              ${
                tab === t
                  ? "bg-white/40 dark:bg-white/10 border-white/40 shadow-xl"
                  : "bg-white/20 dark:bg-white/5 border-white/10 hover:bg-white/30"
              }
            `}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tabs[tab].map((item) => (
          <Link
            key={item}
            href={`/inspections/new/${encodeURIComponent(item)}`}
            className="
              p-6 rounded-2xl shadow-xl
              bg-white/40 dark:bg-white/10
              backdrop-blur-xl border border-white/20
              hover:shadow-2xl hover:bg-white/60 dark:hover:bg-white/20
              transition transform hover:scale-[1.02]
            "
          >
            <div className="text-xl font-semibold mb-2">{item}</div>
            <div className="text-sm opacity-80">
              Create a new inspection document.
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
