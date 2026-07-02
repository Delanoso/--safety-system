"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Shield,
  Bell,
  ClipboardList,
  Users,
  Briefcase,
  HardHat,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  X,
} from "lucide-react";
import SidebarDropdown from "./SidebarDropdown";
import RestrictedAccessModal from "./RestrictedAccessModal";
import { useMobileSidebar } from "@/contexts/MobileSidebarContext";

type UserMe = { allowedModules: string[] | null; role?: string; companyName?: string | null };

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserMe | null>(null);
  const [restrictedModalOpen, setRestrictedModalOpen] = useState(false);
  const { open: mobileOpen, setOpen: setMobileOpen } = useMobileSidebar();

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { user: UserMe | null }) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const allowedModules = user?.allowedModules ?? null;
  const isAdmin = user?.role === "admin" || user?.role === "super";
  const brandTitle = user?.companyName?.trim() || "Salus";
  const onRestrictedClick = () => setRestrictedModalOpen(true);

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity"
        style={{ opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? "auto" : "none" }}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${collapsed ? "w-16 sm:w-20" : "w-64"}
        h-screen p-3 sm:p-4 flex flex-col gap-4 sm:gap-6 overflow-y-auto 
        transition-transform duration-300 lg:transition-[width] lg:duration-300
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}

        backdrop-blur-xl
        bg-[rgba(255,255,255,0.95)]
        dark:bg-[rgba(20,40,80,0.95)]
        lg:bg-[rgba(255,255,255,0.45)]
        dark:lg:bg-[rgba(20,40,80,0.45)]

        border-r border-[rgba(0,0,0,0.1)]
        dark:border-[rgba(255,255,255,0.1)]

        text-[var(--foreground)]
      `}
      >
        <div className="flex items-center justify-between gap-2">
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-[var(--foreground)] truncate">
                Salus
              </h1>
              {brandTitle !== "Salus" && (
                <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
                  {brandTitle}
                </p>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 hover:opacity-70 rounded transition lg:hidden"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:opacity-70 rounded transition hidden lg:block"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
          </div>
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

      <Link
        href="/dashboard/notifications"
        className="
          flex items-center gap-3 px-3 py-2 rounded transition
          hover:text-[var(--gold)]
        "
      >
        <Bell size={20} />
        {!collapsed && "Notifications"}
      </Link>

      <SidebarDropdown
        title="Health & Safety"
        icon={<Shield size={20} />}
        collapsed={collapsed}
        allowedModules={allowedModules}
        onRestrictedClick={onRestrictedClick}
        items={[
          { name: "Training", href: "/training" },
          { name: "Medicals", href: "/medicals" },
          { name: "PPE Management", href: "/ppe-management" },
          { name: "SHE Committee", href: "/she-committee" },
          { name: "Risk Assessments", href: "/risk-assessments" },
          { name: "Hazardous Chemicals", href: "/hazardous-chemicals" },
          { name: "Emergency Drills", href: "/emergency-drills" },
        ]}
      />

      <SidebarDropdown
        title="Compliance"
        icon={<ClipboardList size={20} />}
        collapsed={collapsed}
        allowedModules={allowedModules}
        onRestrictedClick={onRestrictedClick}
        items={[
          { name: "Legal Registers", href: "/legal-registers" },
          { name: "Legal Compliance Register", href: "/legal-compliance" },
          { name: "Appointments", href: "/appointments" },
          { name: "Inspections", href: "/inspections/select-department" },
          { name: "Incidents", href: "/incidents" }, // ⭐ Added
        ]}
      />

      <SidebarDropdown
        title="Site Safety"
        icon={<HardHat size={20} />}
        collapsed={collapsed}
        allowedModules={allowedModules}
        onRestrictedClick={onRestrictedClick}
        items={[
          { name: "Toolbox Talks", href: "/toolbox-talks" },
          { name: "Induction Training", href: "/induction-training" },
          { name: "Visitor Register", href: "/visitor-register" },
          { name: "Permit to Work", href: "/permit-to-work" },
        ]}
      />

      <SidebarDropdown
        title="Operations"
        icon={<Briefcase size={20} />}
        collapsed={collapsed}
        allowedModules={allowedModules}
        onRestrictedClick={onRestrictedClick}
        items={[
          { name: "Maintenance Schedule", href: "/maintenance-schedule" },
        ]}
      />

      <SidebarDropdown
        title="Uploads"
        icon={<ClipboardList size={20} />}
        collapsed={collapsed}
        allowedModules={allowedModules}
        onRestrictedClick={onRestrictedClick}
        items={[
          {
            name: "Section 1",
            children: [
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
              { name: "Truck Certificates", href: "/docs/truck-certificates" },
              { name: "Vessels Under Pressure", href: "/docs/vessels-under-pressure" },
            ],
          },
          {
            name: "Section 3",
            children: [
              { name: "Company Documents", href: "/docs/company-documents" },
            ],
          },
        ]}
      />

      <SidebarDropdown
        title="Contractors"
        icon={<Briefcase size={20} />}
        collapsed={collapsed}
        allowedModules={allowedModules}
        onRestrictedClick={onRestrictedClick}
        items={[
          { name: "Contractors Portal", href: "/contractors" },
        ]}
      />

      <Link
        href="/users"
        className="
          flex items-center gap-3 px-3 py-2 rounded transition
          hover:text-[var(--gold)]
        "
      >
        <Users size={20} />
        {!collapsed && "Users and Staff"}
      </Link>

      {isAdmin && (
        <Link
          href="/settings"
          className="
            flex items-center gap-3 px-3 py-2 rounded transition
            hover:text-[var(--gold)]
          "
        >
          <Settings size={20} />
          {!collapsed && "Settings"}
        </Link>
      )}

      <RestrictedAccessModal
        open={restrictedModalOpen}
        onClose={() => setRestrictedModalOpen(false)}
        showGoToDashboard={true}
      />
    </aside>
    </>
  );
}
