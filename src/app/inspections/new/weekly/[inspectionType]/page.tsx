"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useSearchParams } from "next/navigation";

// Weekly columns
const weeklyColumns = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];

// ID generator
const generateId = () => Math.random().toString(36).substring(2, 12);

// ----------------------
// Helpers
// ----------------------
function loadAllInspections() {
  try {
    const raw = localStorage.getItem("inspections");
    if (!raw) return { daily: [], weekly: [], monthly: [] };
    const parsed = JSON.parse(raw);
    return {
      daily: parsed.daily ?? [],
      weekly: parsed.weekly ?? [],
      monthly: parsed.monthly ?? [],
    };
  } catch {
    return { daily: [], weekly: [], monthly: [] };
  }
}

function saveAllInspections(data: any) {
  localStorage.setItem("inspections", JSON.stringify(data));
}

function loadDepartments(): string[] {
  try {
    const raw = localStorage.getItem("departments");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDepartments(list: string[]) {
  localStorage.setItem("departments", JSON.stringify(Array.from(new Set(list))));
}

// ----------------------
// Component
// ----------------------
export default function WeeklyInspectionPage({
  params,
}: {
  params: Promise<{ inspectionType: string }>;
}) {
  const resolved = use(params);
  const inspectionType = decodeURIComponent(resolved.inspectionType);

  const searchParams = useSearchParams();
  const existingId = searchParams.get("id");

  const createRow = (id: number) => ({
    id: String(id),
    description: "",
    location: "",
    weeks: weeklyColumns.map(() => ""),
  });

  const [rows, setRows] = useState(
    Array.from({ length: 10 }, (_, i) => createRow(i + 1))
  );

  const [department, setDepartment] = useState("");
  const [inspectorName, setInspectorName] = useState("");

  const [departments, setDepartments] = useState<string[]>([]);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [deptQuery, setDeptQuery] = useState("");

  // ----------------------
  // Load departments
  // ----------------------
  useEffect(() => {
    setDepartments(loadDepartments());
  }, []);

  // ----------------------
  // Load existing inspection
  // ----------------------
  useEffect(() => {
    const all = loadAllInspections();

    if (existingId) {
      const found = all.weekly.find((i: any) => i.id === existingId);
      if (found) {
        setDepartment(found.department || "");
        setInspectorName(found.inspectorName || "");
        setRows(found.rows || rows);
        return;
      }
    }
  }, [existingId]);

  // ----------------------
  // Department suggestions
  // ----------------------
  const filteredDepartments = useMemo(() => {
    if (!deptQuery) return departments;
    return departments.filter((d) =>
      d.toLowerCase().includes(deptQuery.toLowerCase())
    );
  }, [departments, deptQuery]);

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setDeptQuery(value);
  };

  // ----------------------
  // Row updates
  // ----------------------
  const addRow = () => setRows([...rows, createRow(rows.length + 1)]);
  const deleteRow = (index: number) =>
    setRows(rows.filter((_, i) => i !== index));

  const updateRow = (index: number, field: string, value: string) => {
    setRows(rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const updateWeek = (rowIndex: number, weekIndex: number, value: string) => {
    setRows(
      rows.map((r, i) =>
        i === rowIndex
          ? {
              ...r,
              weeks: r.weeks.map((w, wi) => (wi === weekIndex ? value : w)),
            }
          : r
      )
    );
  };

  // ----------------------
  // Save inspection
  // ----------------------
  const handleSave = async () => {
    const all = loadAllInspections();
    const now = Date.now();
    const id = existingId || generateId();

    const updated = {
      id,
      type: inspectionType,
      department: department.trim(),
      inspectorName: inspectorName.trim(),
      timestamp: existingId
        ? all.weekly.find((i: any) => i.id === existingId)?.timestamp ?? now
        : now,
      rows,
    };

    const idx = all.weekly.findIndex((i: any) => i.id === id);
    if (idx !== -1) {
      all.weekly[idx] = updated;
    } else {
      all.weekly.push(updated);
    }

    saveAllInspections(all);

    if (department.trim()) {
      const next = [...departments, department.trim()];
      saveDepartments(next);
      setDepartments(Array.from(new Set(next)));
    }

    try {
      await fetch("/api/inspections/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          type: inspectionType,
          department: department.trim(),
          inspectorName: inspectorName.trim(),
          rows,
          columns: weeklyColumns,
          legendItems: [],
          frequency: "weekly",
        }),
      });
    } catch (err) {
      console.error("Save error:", err);
    }

    window.location.href = `/inspections/new/weekly/${encodeURIComponent(inspectionType)}?id=${id}`;
  };

  // ----------------------
  // UI
  // ----------------------
  return (
    <div className="min-h-screen w-screen bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 dark:bg-[#0f172a] py-8 overflow-hidden">

      <div id="pdf-area" className="w-full max-w-7xl mx-auto px-6 space-y-6">

        {/* TITLE */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            {inspectionType} — Weekly Inspection
          </h1>

          {/* Department + Inspector Name */}
          <div className="mt-4 flex flex-col md:flex-row justify-center gap-4">

            {/* Department Combo-Box */}
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                onFocus={() => setShowDeptDropdown(true)}
                className="p-3 rounded-lg w-full bg-white/70 text-black border border-white/30 shadow pr-10"
              />

              {/* Chevron */}
              <button
                type="button"
                onClick={() => setShowDeptDropdown((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-black"
              >
                <svg
                  className={`h-4 w-4 transition-transform ${
                    showDeptDropdown ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              {showDeptDropdown && filteredDepartments.length > 0 && (
                <div className="absolute z-20 mt-2 w-full rounded-xl bg-white/40 backdrop-blur-md shadow-lg border border-white/30">
                  <div className="max-h-56 overflow-auto py-1 text-sm text-gray-900">
                    {filteredDepartments.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          handleDepartmentChange(d);
                          setShowDeptDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-white/70"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Inspector Name */}
            <input
              type="text"
              placeholder="Inspector Name"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              className="p-3 rounded-lg w-full max-w-md bg-white/70 text-black border border-white/30 shadow"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          {/* HEADER */}
          <div
            className="grid gap-2 font-semibold text-sm text-black dark:text-white min-w-max"
            style={{
              gridTemplateColumns: `60px 70px 150px 150px repeat(${weeklyColumns.length}, 100px)`,
            }}
          >
            <div className="text-center">ID</div>
            <div className="text-center">Delete</div>
            <div>Description</div>
            <div>Location</div>
            {weeklyColumns.map((col) => (
              <div key={col} className="text-center">{col}</div>
            ))}
          </div>

          {/* ROWS */}
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-2 items-center min-w-max p-2 rounded-lg bg-white/60 border border-white/20 shadow"
              style={{
                gridTemplateColumns: `60px 70px 150px 150px repeat(${weeklyColumns.length}, 100px)`,
              }}
            >
              {/* ID */}
              <input
                type="text"
                value={row.id}
                onChange={(e) => updateRow(rowIndex, "id", e.target.value)}
                className="p-1 text-sm text-center rounded bg-white border border-gray-300 w-full"
              />

              {/* DELETE */}
              <button
                onClick={() => deleteRow(rowIndex)}
                className="text-red-600 hover:text-red-800 text-lg flex items-center justify-center"
              >
                🗑
              </button>

              {/* DESCRIPTION */}
              <input
                type="text"
                value={row.description}
                onChange={(e) =>
                  updateRow(rowIndex, "description", e.target.value)
                }
                className="p-1 text-sm rounded bg-white border border-gray-300 w-full"
              />

              {/* LOCATION */}
              <input
                type="text"
                value={row.location}
                onChange={(e) =>
                  updateRow(rowIndex, "location", e.target.value)
                }
                className="p-1 text-sm rounded bg-white border border-gray-300 w-full"
              />

              {/* WEEKLY DROPDOWNS */}
              {weeklyColumns.map((_, weekIndex) => (
                <select
                  key={weekIndex}
                  value={row.weeks[weekIndex]}
                  onChange={(e) =>
                    updateWeek(rowIndex, weekIndex, e.target.value)
                  }
                  className={`
                    p-2 rounded border border-gray-300 text-center text-sm
                    ${row.weeks[weekIndex] === "OK" ? "bg-green-300" : ""}
                    ${row.weeks[weekIndex] === "MIS" ? "bg-red-300" : ""}
                    ${row.weeks[weekIndex] === "DEF" ? "bg-yellow-300" : ""}
                  `}
                >
                  <option value=""></option>
                  <option value="OK">OK</option>
                  <option value="MIS">MIS</option>
                  <option value="DEF">DEF</option>
                </select>
              ))}
            </div>
          ))}
        </div>

        {/* ADD LINE BUTTON */}
        <button
          onClick={addRow}
          className="px-4 py-2 bg-blue-600/70 text-white rounded-lg shadow hover:bg-blue-700/70 transition"
        >
          + Add Line
        </button>

      </div>

      {/* SAVE + COMPLETED CHECKBOX */}
      <div className="w-full max-w-7xl mx-auto px-6 mt-6 flex flex-col md:flex-row items-center gap-4">

        {/* Inspection Completed */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="inspection-completed"
            className="w-5 h-5 accent-green-600"
          />
          <label
            htmlFor="inspection-completed"
            className="text-white text-sm font-medium"
          >
            Inspection Completed
          </label>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-green-600/70 text-white rounded-lg shadow hover:bg-green-700/70 transition"
        >
          Save Document
        </button>

      </div>
    </div>
  );
}

