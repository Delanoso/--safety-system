"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard } from "lucide-react";

export default function PPEManagementPage() {
  const router = useRouter();

  const items = [
    {
      title: "Dashboard",
      description: "Stock summary, low-stock alerts, pending signatures, and issues today.",
      route: "/ppe-management/dashboard",
    },
    {
      title: "PPE Size List",
      description: "Manage people and their PPE sizes. Import/export Excel, add and edit people.",
      route: "/ppe-management/size-list",
    },
    {
      title: "Reminders",
      description: "Send a WhatsApp link so people can open it and choose their PPE sizes (by sub-department).",
      route: "/ppe-management/reminders",
    },
    {
      title: "Stock List",
      description: "Track PPE in stock. Receive stock, adjust quantities, view movement history.",
      route: "/ppe-management/stock-list",
    },
    {
      title: "PPE Issue Register",
      description: "Issue PPE to people and record signatures. Send for electronic signature via WhatsApp.",
      route: "/ppe-management/issue-register",
    },
    {
      title: "Reports",
      description: "View and export issues and stock movements to Excel.",
      route: "/ppe-management/reports",
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-blue-200 to-purple-300 min-w-0">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-10">
        <div className="flex justify-start">
          <Link href="/dashboard" className="button button-neutral flex items-center gap-2 text-sm sm:text-base">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">PPE Management</h1>
        <p className="text-black/70 text-sm sm:text-base">
          Dashboard, size list, stock tracking, issuing and signatures, and reports. People from the size list appear in the issue register.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.route)}
              className="text-left p-4 sm:p-6 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 hover:bg-white/80 transition"
            >
              <h2 className="text-base sm:text-xl font-bold text-black mb-2">{item.title}</h2>
              <p className="text-black/70 text-sm">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
