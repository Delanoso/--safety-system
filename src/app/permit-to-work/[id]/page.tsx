"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PERMIT_STATUSES, permitStatusLabel, permitTypeLabel } from "@/lib/site-safety";
import { downloadPdf } from "@/lib/pdf-download";

type Permit = {
  id: string;
  permitNumber: string | null;
  permitType: string;
  title: string;
  workDescription: string | null;
  department: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  hazards: string | null;
  controls: string | null;
  status: string;
  issuerName: string | null;
  receiverName: string | null;
  fileUrl: string | null;
};

export default function PermitToWorkViewPage() {
  const params = useParams();
  const id = params.id as string;
  const [permit, setPermit] = useState<Permit | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/permit-to-work/${id}`)
      .then((r) => r.json())
      .then((data: Permit) => {
        setPermit(data);
        setStatus(data.status);
      })
      .catch(() => setPermit(null));
  }, [id]);

  async function updateStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!permit) return;
    setSaving(true);
    const res = await fetch(`/api/permit-to-work/${permit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    if (!res.ok) {
      alert("Failed to update status");
      return;
    }
    const updated = await res.json();
    setPermit(updated);
  }

  if (!permit) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-amber-100 to-orange-200">
        <p className="text-black/70">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <Link href="/permit-to-work/list" className="button button-neutral">Back to list</Link>
          <button
            type="button"
            onClick={() => downloadPdf("permit-to-work", permit.id)}
            className="button button-neutral"
          >
            Download PDF
          </button>
        </div>
        <div className="p-6 sm:p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 space-y-4">
          <h1 className="text-2xl font-bold text-black">{permit.title}</h1>
          <p className="text-sm text-black/60">
            {permitTypeLabel(permit.permitType)}
            {permit.permitNumber ? ` · #${permit.permitNumber}` : ""}
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><dt className="font-semibold text-black/60">Status</dt><dd>{permitStatusLabel(permit.status)}</dd></div>
            <div><dt className="font-semibold text-black/60">Location</dt><dd>{permit.location ?? "—"}</dd></div>
            <div><dt className="font-semibold text-black/60">Start</dt><dd>{new Date(permit.startDate).toLocaleDateString()}</dd></div>
            <div><dt className="font-semibold text-black/60">End</dt><dd>{permit.endDate ? new Date(permit.endDate).toLocaleDateString() : "—"}</dd></div>
            <div><dt className="font-semibold text-black/60">Issuer</dt><dd>{permit.issuerName ?? "—"}</dd></div>
            <div><dt className="font-semibold text-black/60">Receiver</dt><dd>{permit.receiverName ?? "—"}</dd></div>
          </dl>
          {permit.workDescription && (
            <div>
              <h2 className="font-semibold mb-1">Work description</h2>
              <p className="text-sm whitespace-pre-wrap">{permit.workDescription}</p>
            </div>
          )}
          {permit.hazards && (
            <div>
              <h2 className="font-semibold mb-1">Hazards</h2>
              <p className="text-sm whitespace-pre-wrap">{permit.hazards}</p>
            </div>
          )}
          {permit.controls && (
            <div>
              <h2 className="font-semibold mb-1">Controls</h2>
              <p className="text-sm whitespace-pre-wrap">{permit.controls}</p>
            </div>
          )}
          {permit.fileUrl && (
            <a href={permit.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">View attachment</a>
          )}
          <form onSubmit={updateStatus} className="flex flex-wrap gap-3 items-end pt-4 border-t border-white/40">
            <div>
              <label className="block text-sm font-semibold mb-1">Update status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 rounded-lg border border-white/40 bg-white/70">
                {PERMIT_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
              {saving ? "Saving…" : "Save status"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
