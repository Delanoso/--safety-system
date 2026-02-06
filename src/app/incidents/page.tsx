"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  FolderOpen,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";

export default function IncidentsPage() {
  const [openNewDropdown, setOpenNewDropdown] = useState(false);

  return (
    <div className="min-h-screen w-full p-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* TOP LEFT DASHBOARD BUTTON */}
        <div className="flex justify-start">
          <Link href="/dashboard" className="button button-neutral flex items-center gap-2">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>

        {/* PAGE HEADER */}
        <div
          className="rounded-2xl p-8 backdrop-blur-xl shadow-xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h1 className="text-4xl font-bold">Incident Management</h1>
          <p className="opacity-70 mt-2">
            Record, track, analyze, and document workplace incidents.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 gap-6">

          {/* NEW INCIDENT REPORT */}
          <div
            className="rounded-2xl p-6 backdrop-blur-xl shadow-xl"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <button
              onClick={() => setOpenNewDropdown(!openNewDropdown)}
              className="w-full flex items-center justify-between text-left text-xl font-semibold"
            >
              <span className="flex items-center gap-3">
                <PlusCircle size={26} />
                New Incident Report
              </span>
              {openNewDropdown ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
            </button>

            {openNewDropdown && (
              <div className="mt-4 space-y-3 pl-10">
                <Link
                  href="/incidents/new/incident"
                  className="block px-4 py-2 rounded-lg font-medium transition"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  Incident
                </Link>

                <Link
                  href="/incidents/new/nearmiss"
                  className="block px-4 py-2 rounded-lg font-medium transition"
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  Near Miss
                </Link>
              </div>
            )}
          </div>

          {/* ONGOING INCIDENTS */}
          <Link
            href="/incidents/ongoing"
            className="rounded-2xl p-6 backdrop-blur-xl shadow-xl flex items-center justify-between transition"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <span className="flex items-center gap-3 text-xl font-semibold">
              <FolderOpen size={26} />
              Ongoing Incidents
            </span>
          </Link>

          {/* LIST OF PAST INCIDENTS */}
          <Link
            href="/incidents/list"
            className="rounded-2xl p-6 backdrop-blur-xl shadow-xl flex items-center justify-between transition"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <span className="flex items-center gap-3 text-xl font-semibold">
              <FolderOpen size={26} />
              List of Past Incidents & Reports
            </span>
          </Link>

          {/* COST ANALYSIS */}
          <Link
            href="/incidents/cost-analysis"
            className="rounded-2xl p-6 backdrop-blur-xl shadow-xl flex items-center justify-between transition"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <span className="flex items-center gap-3 text-xl font-semibold">
              <FileText size={26} />
              Cost Analysis
            </span>
          </Link>

          {/* RELEVANT DOCUMENTATION */}
          <Link
            href="/incidents/documentation"
            className="rounded-2xl p-6 backdrop-blur-xl shadow-xl flex items-center justify-between transition"
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--card-border)",
            }}
          >
            <span className="flex items-center gap-3 text-xl font-semibold">
              <FileText size={26} />
              Relevant Documentation
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

