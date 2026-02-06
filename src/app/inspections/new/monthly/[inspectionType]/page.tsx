"use client";

import { useState, use } from "react";

// -------------------------------------------------------------
// MONTHLY COLUMNS
// -------------------------------------------------------------
const monthlyColumns = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// -------------------------------------------------------------
// PAGE COMPONENT
// -------------------------------------------------------------
export default function MonthlyInspectionPage({
  params,
}: {
  params: Promise<{ inspectionType: string }>;
}) {
  const resolved = use(params);
  const inspectionType = decodeURIComponent(resolved.inspectionType);

  const createRow = (id: number) => ({
    id: String(id),
    description: "",
    location: "",
    months: monthlyColumns.map(() => ""), // start empty
  });

  const [rows, setRows] = useState(
    Array.from({ length: 10 }, (_, i) => createRow(i + 1))
  );

  const [inspectorName, setInspectorName] = useState("");
  const [completed, setCompleted] = useState(false);

  const addRow = () => setRows([...rows, createRow(rows.length + 1)]);
  const deleteRow = (index: number) =>
    setRows(rows.filter((_, i) => i !== index));

  const updateRow = (index: number, field: string, value: string) => {
    setRows(rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  };

  const updateMonth = (rowIndex: number, monthIndex: number, value: string) => {
    setRows(
      rows.map((r, i) =>
        i === rowIndex
          ? {
              ...r,
              months: r.months.map((m, mi) => (mi === monthIndex ? value : m)),
            }
          : r
      )
    );
  };

  const handleSave = () => {
    console.log("Inspection Type:", inspectionType);
    console.log("Inspector:", inspectorName);
    console.log("Rows:", rows);
    console.log("Completed:", completed);
    alert("Monthly inspection document saved.");
  };

  return (
    <div
      className="
        min-h-screen w-screen 
        bg-gradient-to-r from-teal-300 via-blue-300 to-purple-300
        dark:bg-[#0f172a]
        py-8 overflow-hidden
      "
    >
      <div className="w-full max-w-7xl mx-auto px-6 space-y-6">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            {inspectionType} — Monthly Inspection
          </h1>

          <div className="mt-3 flex justify-center">
            <input
              type="text"
              placeholder="Inspector Name"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              className="
                p-3 rounded-lg w-full max-w-md
                bg-white/70 text-black
                border border-white/30 shadow
              "
            />
          </div>
        </div>

        {/* TABLE SCROLL WRAPPER */}
        <div className="overflow-x-auto">

          {/* HEADER ROW */}
          <div
            className="
              grid gap-2 font-semibold text-sm text-black dark:text-white min-w-max
            "
            style={{
              gridTemplateColumns: `60px 70px 200px 150px repeat(${monthlyColumns.length}, 100px)`,
            }}
          >
            <div className="text-center">ID</div>
            <div className="text-center">Delete</div>
            <div>Description</div>
            <div>Location</div>
            {monthlyColumns.map((col) => (
              <div key={col} className="text-center">{col}</div>
            ))}
          </div>

          {/* ROWS */}
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="
                grid gap-2 items-center min-w-max
                p-2 rounded-lg
                bg-white/60 border border-white/20 shadow
              "
              style={{
                gridTemplateColumns: `60px 70px 200px 150px repeat(${monthlyColumns.length}, 100px)`,
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

              {/* MONTHLY DROPDOWNS */}
              {monthlyColumns.map((_, monthIndex) => (
                <select
                  key={monthIndex}
                  value={row.months[monthIndex]}
                  onChange={(e) =>
                    updateMonth(rowIndex, monthIndex, e.target.value)
                  }
                  className={`
                    p-2 rounded border border-gray-300 text-center text-sm
                    ${row.months[monthIndex] === "" ? "bg-white" : ""}
                    ${row.months[monthIndex] === "OK" ? "bg-green-300" : ""}
                    ${row.months[monthIndex] === "MIS" ? "bg-red-300" : ""}
                    ${row.months[monthIndex] === "DEF" ? "bg-yellow-300" : ""}
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

        {/* ADD ROW */}
        <button
          onClick={addRow}
          className="
            px-4 py-2 bg-blue-600 text-white rounded-lg shadow 
            hover:bg-blue-700 transition
          "
        >
          + Add Line
        </button>

        {/* COMPLETED + SAVE (MATCHES WEEKLY LAYOUT) */}
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 mt-6">

          {/* COMPLETED CHECKBOX */}
          <div className="flex items-center gap-2 text-black dark:text-white">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-5 h-5 accent-green-600"
            />
            <span className="text-sm font-medium">Inspection Completed</span>
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            className="
              px-6 py-3 bg-green-600 text-white rounded-lg shadow 
              hover:bg-green-700 transition
            "
          >
            Save Document
          </button>

        </div>

      </div>
    </div>
  );
}

