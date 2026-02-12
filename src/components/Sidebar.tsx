"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  Shield,
  ClipboardList,
  Users,
  Briefcase,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import SidebarDropdown from "./SidebarDropdown";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        ${collapsed ? "w-20" : "w-64"}
        h-screen p-4 flex flex-col gap-6 overflow-y-auto 
        transition-all duration-300

        backdrop-blur-xl
        bg-[rgba(255,255,255,0.45)]
        dark:bg-[rgba(20,40,80,0.45)]

        border-r border-[rgba(0,0,0,0.1)]
        dark:border-[rgba(255,255,255,0.1)]

        text-[var(--foreground)]
      `}
    >
      <div className="flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-xl font-bold text-[var(--foreground)]">
            Safety System
          </h1>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:opacity-70 rounded transition"
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      <Link
        href="/dashboard"
        className="
          flex items-center gap-3 px-3 py-2 rounded transition
          hover:text-[var(--gold)]
        "
      >
        <Home size={20} />
        {!collapsed && "Dashboard"}
      </Link>

      <SidebarDropdown
        title="Health & Safety"
        icon={<Shield size={20} />}
        collapsed={collapsed}
        items={[
          {
            name: "Section 1",
            children: [
              { name: "Policies", href: "/docs/policies" },
              { name: "Working Procedures", href: "/docs/working-procedures" },
              { name: "Fire Equipment", href: "/docs/fire-equipment" },
              { name: "First Aid", href: "/docs/first-aid" },
              { name: "Emergency Response", href: "/docs/emergency-response" },
              { name: "Hygiene Facilities", href: "/docs/hygiene-facilities" },
              { name: "Waste Management", href: "/docs/waste-management" },
              { name: "Ventilation", href: "/docs/ventilation" },
              { name: "Lighting", href: "/docs/lighting" },
            ],
          },
          {
            name: "Section 2",
            children: [
              { name: "Hand Tools", href: "/docs/hand-tools" },
              { name: "Notices and Signs", href: "/docs/notices-signs" },
              { name: "Portable and Fixed Ladders", href: "/docs/portable-fixed-ladders" },
              { name: "Pollution Prevention", href: "/docs/pollution-prevention" },
              { name: "Electrical Installations", href: "/docs/electrical-installations" },
              { name: "Racking, Stacking and Storing", href: "/docs/racking-stacking-storing" },
              { name: "Scaffolding", href: "/docs/scaffolding" },
              { name: "Vessels Under Pressure", href: "/docs/vessels-under-pressure" },
            ],
          },
          { name: "Training", href: "/training" },
          { name: "Medicals", href: "/medicals" },
          { name: "PPE Management", href: "/ppe-management" },
          { name: "SHE Committee", href: "/she-committee" },
          { name: "Risk Assessments", href: "/risk-assessments" },
          { name: "Hazardous Chemicals", href: "/hazardous-chemicals" },
        ]}
      />

      <SidebarDropdown
        title="Compliance"
        icon={<ClipboardList size={20} />}
        collapsed={collapsed}
        items={[
          { name: "Legal Registers", href: "/legal-registers" },
          { name: "Appointments", href: "/appointments" },
          { name: "Inspections", href: "/inspections" },
          { name: "Incidents", href: "/incidents" }, // ⭐ Added
        ]}
      />

      <SidebarDropdown
        title="Operations"
        icon={<Briefcase size={20} />}
        collapsed={collapsed}
        items={[
          { name: "Maintenance Schedule", href: "/maintenance-schedule" },
        ]}
      />

      <SidebarDropdown
        title="People"
        icon={<Users size={20} />}
        collapsed={collapsed}
        items={[
          { name: "Users", href: "/users" },
          { name: "Contractors Portal", href: "/contractors" },
        ]}
      />


    </aside>
  );
}
