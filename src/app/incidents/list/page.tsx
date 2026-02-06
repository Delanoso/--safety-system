"use client";

import { useEffect, useState } from "react";
import { FileDown, Eye, Trash2 } from "lucide-react";

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
    <div className="min-h-screen p-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* HEADER */}
        <div
          className="rounded-2xl p-8 backdrop-blur-xl shadow-xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h1 className="text-4xl font-bold">Completed Incidents</h1>
          <p className="opacity-70 mt-2">
            View, download, or delete finalized incident reports.
          </p>
        </div>

        {/* NO INCIDENTS */}
        {incidents.length === 0 && (
          <p className="text-center text-lg opacity-70">
            No completed incidents found.
          </p>
        )}

        {/* INCIDENT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <div className="p-6 space-y-4">
                  <h2 className="text-2xl font-bold">{incident.title}</h2>

                  <p className="opacity-70 text-sm">
                    {incident.description || "No short description provided"}
                  </p>

                  <div className="opacity-80 text-sm space-y-1">
                    <p><strong>Date:</strong> {formatDate(incident.date)}</p>
                    <p><strong>Department:</strong> {incident.department || "N/A"}</p>
                    <p><strong>Severity:</strong> {incident.severity}</p>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex gap-3 pt-4 flex-wrap">

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

