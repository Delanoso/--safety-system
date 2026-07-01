"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DRILL_STATUSES, drillStatusLabel, drillTypeLabel } from "@/lib/emergency-drills";
import { downloadPdf } from "@/lib/pdf-download";

type Drill = {
  id: string;
  drillType: string;
  title: string;
  drillDate: string;
  location: string | null;
  department: string | null;
  coordinator: string | null;
  participantCount: number | null;
  durationMinutes: number | null;
  findings: string | null;
  correctiveActions: string | null;
  status: string;
  fileUrl: string | null;
};

export default function EmergencyDrillViewPage() {
  const params = useParams();
  const id = params.id as string;
  const [drill, setDrill] = useState<Drill | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/emergency-drills/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data?.id) { setDrill(null); return; }
        setDrill(data);
        setStatus(data.status);
      })
      .catch(() => setDrill(null));
  }, [id]);

  async function updateStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!drill) return;
    setSaving(true);
    const res = await fetch(`/api/emergency-drills/${drill.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    if (!res.ok) { alert("Failed to update status"); return; }
    setDrill(await res.json());
  }

  if (!drill) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
        <p className="text-black/70">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <Link href="/emergency-drills/list" className="button button-neutral">Back to list</Link>
          <button
            type="button"
            onClick={() => downloadPdf("emergency-drill", drill.id)}
            className="button button-neutral"
          >
            Download PDF
          </button>
        </div>
        <div className="p-6 sm:p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 space-y-4">
          <h1 className="text-2xl font-bold text-black">{drill.title}</h1>
          <p className="text-sm text-black/60">{drillTypeLabel(drill.drillType)} · {drillStatusLabel(drill.status)}</p>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><dt className="font-semibold text-black/60">Date</dt><dd>{new Date(drill.drillDate).toLocaleDateString()}</dd></div>
            <div><dt className="font-semibold text-black/60">Duration</dt><dd>{drill.durationMinutes ? `${drill.durationMinutes} min` : "—"}</dd></div>
            <div><dt className="font-semibold text-black/60">Location</dt><dd>{drill.location ?? "—"}</dd></div>
            <div><dt className="font-semibold text-black/60">Department</dt><dd>{drill.department ?? "—"}</dd></div>
            <div><dt className="font-semibold text-black/60">Coordinator</dt><dd>{drill.coordinator ?? "—"}</dd></div>
            <div><dt className="font-semibold text-black/60">Participants</dt><dd>{drill.participantCount ?? "—"}</dd></div>
          </dl>

          {drill.findings && (
            <div>
              <h2 className="font-semibold mb-1">Findings</h2>
              <p className="text-sm whitespace-pre-wrap">{drill.findings}</p>
            </div>
          )}
          {drill.correctiveActions && (
            <div>
              <h2 className="font-semibold mb-1">Corrective actions</h2>
              <p className="text-sm whitespace-pre-wrap">{drill.correctiveActions}</p>
            </div>
          )}
          {drill.fileUrl && (
            <a href={drill.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View attachment</a>
          )}

          <form onSubmit={updateStatus} className="flex flex-wrap gap-3 items-end pt-4 border-t border-white/40">
            <div>
              <label className="block text-sm font-semibold mb-1">Update status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 rounded-lg border border-white/40 bg-white/70">
                {DRILL_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving…" : "Save status"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
