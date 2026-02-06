import React from "react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function PdfRendererPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const type = typeof searchParams.type === "string" ? searchParams.type : "";
  const id = typeof searchParams.id === "string" ? searchParams.id : "";

  if (!type || !id) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff" }}>
        <h1>Missing parameters</h1>
        <p>Expected query params: type and id.</p>
      </div>
    );
  }

  switch (type) {
    case "daily-inspection":
      return <DailyInspectionTemplate id={id} />;

    case "appointment":
      return <AppointmentTemplate id={id} />;

    default:
      return (
        <div style={{ padding: 40, fontFamily: "Arial", background: "#fff" }}>
          <h1>Unknown PDF type</h1>
          <p>Type: {type}</p>
        </div>
      );
  }
}

async function DailyInspectionTemplate({ id }: { id: string }) {
  const inspection = await prisma.dailyInspection.findUnique({
    where: { id },
  });

  if (!inspection) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", background: "#fff" }}>
        <h1>Inspection not found</h1>
        <p>No inspection exists for ID: {id}</p>
      </div>
    );
  }

  let parsed: {
    columns: string[];
    legendItems: string[];
    rows: string[][];
  } = {
    columns: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    legendItems: [],
    rows: [],
  };

  try {
    parsed = {
      ...parsed,
      ...(inspection.data ? JSON.parse(inspection.data as string) : {}),
    };
  } catch {
    // ignore parse errors
  }

  const { columns, legendItems, rows } = parsed;

  return (
    <div
      style={{
        margin: 0,
        padding: 40,
        fontFamily: "Arial, sans-serif",
        background: "#ffffff",
        color: "#000000",
      }}
    >
      <div style={{ borderBottom: "2px solid #000", marginBottom: 30 }}>
        <h1 style={{ margin: 0 }}>Daily Inspection Report</h1>
        <div style={{ fontSize: 12 }}>Inspection ID: {id}</div>
      </div>

      <div style={{ marginBottom: 25, fontSize: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Department:</strong> {inspection.department}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Inspector:</strong> {inspection.inspector}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <strong>Created At:</strong>{" "}
          {new Date(inspection.createdAt).toLocaleString()}
        </div>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 12,
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #000", padding: 6 }}>#</th>
            <th
              style={{ border: "1px solid #000", padding: 6, textAlign: "left" }}
            >
              Inspection Item
            </th>
            {columns.map((col) => (
              <th key={col} style={{ border: "1px solid #000", padding: 6 }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {legendItems.map((item, rowIndex) => (
            <tr key={rowIndex}>
              <td style={{ border: "1px solid #000", padding: 6 }}>
                {rowIndex + 1}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: 6,
                  textAlign: "left",
                }}
              >
                {item}
              </td>
              {columns.map((_, colIndex) => (
                <td
                  key={colIndex}
                  style={{ border: "1px solid #000", padding: 6 }}
                >
                  {rows?.[rowIndex]?.[colIndex] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: 40,
          paddingTop: 10,
          borderTop: "1px solid #000",
          textAlign: "center",
          fontSize: 10,
        }}
      >
        Safety System — Daily Inspection Report
      </div>
    </div>
  );
}
