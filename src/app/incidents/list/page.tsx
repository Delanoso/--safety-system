"use client";

import { useEffect, useState } from "react";
import { FileDown, Eye, Trash2, Pencil } from "lucide-react";
import { downloadPdf } from "@/lib/pdf-download";
import { incidentPdfDownloadType, incidentTypeLabel } from "@/lib/incident-constants";

export default function PastIncidentsPage() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    const res = await fetch("/api/incidents", { cache: "no-store" });
    const json = await res.json();

    const list = Array.isArray(json.incidents) ? json.incidents : [];

    const completed = list.filter(
      (i) => i.status === "completed" || i.status === "signed"
    );

    setIncidents(completed);
  }

  async function deleteIncident(id) {
    const confirmDelete = confirm("Are you sure you want to delete this incident?");
    if (!confirmDelete) return;

    await fetch(`/api/incidents/${id}`, {
      method: "DELETE",
    });

    loadIncidents();
  }

  function formatDate(dateString) {
    const d = new Date(dateString);
    return d.toLocaleDateString();
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 min-w-0">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10">

        {/* HEADER */}
        <div
          className="rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-xl shadow-xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Completed Reports</h1>
          <p className="opacity-70 mt-2 text-sm sm:text-base">
            View, download, edit, or delete finalized incident, accident, and near miss reports.
          </p>
        </div>

        {/* NO INCIDENTS */}
        {incidents.length === 0 && (
          <p className="text-center text-base sm:text-lg opacity-70">
            No completed reports found.
          </p>
        )}

        {/* INCIDENT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {incidents.map((incident) => {
            const firstImage =
              incident.images && incident.images.length > 0
                ? incident.images[0].url
                : null;

            return (
              <div
                key={incident.id}
                className="rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl"
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                }}
              >
                {/* IMAGE */}
                {firstImage && (
                  <img
                    src={firstImage}
                    alt="Incident"
                    className="w-full h-48 object-cover"
                  />
                )}

                {/* CONTENT */}
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold">{incident.title}</h2>
                  {(incident.type === "accident" || incident.type === "near_miss") && (
                    <span
                      className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                        incident.type === "accident"
                          ? "bg-amber-500/20 text-amber-200 border-amber-400/40"
                          : "bg-sky-500/20 text-sky-200 border-sky-400/40"
                      }`}
                    >
                      {incidentTypeLabel(incident.type)}
                    </span>
                  )}

                  <p className="opacity-70 text-sm">
                    {incident.description || "No short description provided"}
                  </p>

                  <div className="opacity-80 text-sm space-y-1">
                    <p><strong>Date:</strong> {formatDate(incident.date)}</p>
                    <p>
                      <strong>
                        {incident.type === "accident" ? "Area of Accident" : "Department"}:
                      </strong>{" "}
                      {incident.department || "N/A"}
                    </p>
                    <p><strong>Severity:</strong> {incident.severity}</p>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex gap-3 pt-4 flex-wrap">

                    {/* EDIT REPORT */}
                    <a
                      href={`/incidents/edit/${incident.id}`}
                      className="button button-save flex items-center gap-2"
                    >
                      <Pencil size={18} />
                      Edit
                    </a>

                    {/* VIEW REPORT */}
                    <a
                      href={`/incidents/view/${incident.id}`}
                      className="button button-neutral flex items-center gap-2"
                    >
                      <Eye size={18} />
                      View Report
                    </a>

                    {/* DOWNLOAD PDF */}
                    <button
                      type="button"
                      className="button button-pdf flex items-center gap-2"
                      onClick={() =>
                        downloadPdf(incidentPdfDownloadType(incident.type), incident.id)
                      }
                    >
                      <FileDown size={18} />
                      Download PDF
                    </button>

                    {/* DELETE INCIDENT */}
                    <button
                      type="button"
                      onClick={() => deleteIncident(incident.id)}
                      className="button button-delete flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

