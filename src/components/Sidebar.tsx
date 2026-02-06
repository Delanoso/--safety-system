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
        title="Compliance"
        icon={<ClipboardList size={20} />}
        collapsed={collapsed}
        items={[
          { name: "Appointments", href: "/appointments" },
          { name: "Policies", href: "/policies" },
          { name: "Working Procedures", href: "/working-procedures" },
          { name: "Legal Registers", href: "/legal-registers" },
          { name: "Audit Logs", href: "/audit-logs" },
        ]}
      />

      <SidebarDropdown
        title="Operations"
        icon={<Briefcase size={20} />}
        collapsed={collapsed}
        items={[
          { name: "Maintenance Schedule", href: "/maintenance-schedule" },
          { name: "Asset Tracking", href: "/asset-tracking" },
          { name: "Equipment Lists", href: "/equipment-lists" },
        ]}
      />

      <SidebarDropdown
        title="People"
        icon={<Users size={20} />}
        collapsed={collapsed}
        items={[
          { name: "Users", href: "/users" },
          {
            name: "Roles and Personnel and Certification",
            href: "/roles-personnel-certification",
          },
          { name: "Medicals", href: "/medicals" },
          { name: "Incidents", href: "/incidents" }, // ⭐ Added
        ]}
      />

      <SidebarDropdown
        title="Health & Safety"
        icon={<Shield size={20} />}
        collapsed={collapsed}
        items={[
          {
            name: "Section 1",
            children: [
              { name: "Fire Equipment", href: "/fire-equipment" },
              { name: "First Aid", href: "/first-aid" },
              { name: "Hygiene Facilities", href: "/hygiene-facilities" },
              { name: "Risk Assessments", href: "/risk-assessments" },
              { name: "Hazardous Chemicals", href: "/hazardous-chemicals" },
              { name: "Waste Management", href: "/Waste-management" },
              { name: "Ventilation", href: "/ventilation" },
              { name: "Lighting", href: "/lighting" },
            ],
          },
          {
            name: "Section 2",
            children: [
              { name: "Hand Tools", href: "/hand-tools" },
              { name: "Notices and Signs", href: "/notices-signs" },
              { name: "Portable and Fixed Ladders", href: "/ladders" },
              { name: "Pollution Prevention", href: "/pollution-prevention" },
              { name: "Electrical Installations", href: "/electrical-installations" },
              { name: "Racking, Stacking and Storing", href: "/racking-stacking-storing" },
              { name: "Scaffolding", href: "/scaffolding" },
              { name: "Vessels Under Pressure", href: "/vessels-under-pressure" },
            ],
          },
          { name: "Inspections", href: "/inspections" },
          { name: "Training", href: "/training" },
          { name: "PPE Management", href: "/ppe-management" },
          { name: "Emergency Response", href: "/emergency-response" },
          { name: "SHE Committee", href: "/she-committee" },
        ]}
      />
    </aside>
  );
}
