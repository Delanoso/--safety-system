"use client";
import { useState, useEffect, useMemo, use } from "react";
import { useSearchParams } from "next/navigation";
import { inspectionLegends } from "@/app/data/inspectionLegends";

const dailyColumns = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const generateId = () => Math.random().toString(36).substring(2, 12);

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

export default function DailyInspectionPage({
  params,
}: {
  params: Promise<{ inspectionType: string }>;
}) {
  const resolved = use(params);
  const inspectionType = decodeURIComponent(resolved.inspectionType);

  const searchParams = useSearchParams();
  const existingId = searchParams.get("id");

  const legendText = inspectionLegends[inspectionType] ?? "";
  const legendItems = legendText
    .split(".")
    .map((i) => i.trim())
    .filter((i) => i.length > 0);

  const [department, setDepartment] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [rows, setRows] = useState(
    legendItems.map(() => dailyColumns.map(() => ""))
  );

  const [departments, setDepartments] = useState<string[]>([]);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [deptQuery, setDeptQuery] = useState("");

  useEffect(() => {
    setDepartments(loadDepartments());
  }, []);

  useEffect(() => {
    const all = loadAllInspections();

    if (existingId) {
      const found = all.daily.find((i: any) => i.id === existingId);
      if (found) {
        setDepartment(found.department || "");
        setInspectorName(found.inspectorName || "");
        setRows(found.rows || rows);
      }
    }
  }, [existingId]);

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

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    setRows((prev) =>
      prev.map((row, r) =>
        r === rowIndex
          ? row.map((cell, c) => (c === colIndex ? value : cell))
          : row
      )
    );
  };

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
        ? all.daily.find((i: any) => i.id === existingId)?.timestamp ?? now
        : now,
      rows,
    };

    const idx = all.daily.findIndex((i: any) => i.id === id);
    if (idx !== -1) {
      all.daily[idx] = updated;
    } else {
      all.daily.push(updated);
    }

    saveAllInspections(all);

    if (department.trim()) {
      const next = [...departments, department.trim()];
      saveDepartments(next);
      setDepartments(Array.from(new Set(next)));
    }

    // ⭐ Save to Prisma
    await fetch("/api/inspections/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        type: inspectionType,
        department: department.trim(),
        inspectorName: inspectorName.trim(),
        rows,
        columns: dailyColumns,
        legendItems,
        frequency: "daily",
      }),
    });

    window.location.href = `/inspections/new/daily/${inspectionType}?id=${id}`;
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300 dark:bg-[#0f172a] py-8 overflow-hidden">
      <div id="pdf-area" className="w-full max-w-7xl mx-auto px-6 space-y-6">

        <div className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            {inspectionType} — Daily Inspection
          </h1>

          <div className="mt-4 flex flex-col md:flex-row justify-center gap-4">

            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                onFocus={() => setShowDeptDropdown(true)}
                className="p-3 rounded-lg w-full bg-white/70 text-black border border-white/30 shadow pr-10"
              />

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

            <input
              type="text"
              placeholder="Inspector Name"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              className="p-3 rounded-lg w-full max-w-md bg-white/70 text-black border border-white/30 shadow"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div
            className="grid gap-2 font-semibold text-sm text-black dark:text-white min-w-max"
            style={{
              gridTemplateColumns: `50px 400px repeat(${dailyColumns.length}, 80px)`,
            }}
          >
            <div className="text-center">#</div>
            <div>Inspection Item</div>
            {dailyColumns.map((col) => (
              <div key={col} className="text-center">
                {col}
              </div>
            ))}
          </div>

          {legendItems.map((item, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-2 items-center min-w-max p-2 rounded-lg bg-white/60 border border-white/20 shadow"
              style={{
                gridTemplateColumns: `50px 400px repeat(${dailyColumns.length}, 80px)`,
              }}
            >
              <div className="text-center font-semibold">{rowIndex + 1}</div>

              <div className="text-black font-medium">{item}</div>

              {dailyColumns.map((_, colIndex) => (
                <select
                  key={colIndex}
                  value={rows[rowIndex][colIndex]}
                  onChange={(e) =>
                    updateCell(rowIndex, colIndex, e.target.value)
                  }
                  className={`
                    p-2 rounded border border-gray-300 text-center text-sm
                    ${rows[rowIndex][colIndex] === "OK" ? "bg-green-300" : ""}
                    ${rows[rowIndex][colIndex] === "DEF" ? "bg-yellow-300" : ""}
                    ${rows[rowIndex][colIndex] === "MIS" ? "bg-red-300" : ""}
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

        <button
          onClick={() => setRows([...rows, dailyColumns.map(() => "")])}
          className="px-4 py-2 bg-blue-600/70 text-white rounded-lg shadow hover:bg-blue-700/70 transition"
        >
          + Add Line
        </button>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 mt-6 flex gap-4">

        <button
          onClick={handleSave}
          className="px-6 py-3 bg-green-600/70 text-white rounded-lg shadow hover:bg-green-700/70 transition"
        >
          Save Document
        </button>

        {existingId && (
          <a
            href={`/api/inspections/daily/${existingId}/pdf`}
            target="_blank"
            className="px-6 py-3 bg-purple-600/70 text-white rounded-lg shadow hover:bg-purple-700/70 transition"
          >
            Download PDF
          </a>
        )}
      </div>
    </div>
  );
}

