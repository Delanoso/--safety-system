"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { downloadPdf } from "@/lib/pdf-download";
import ToolboxAttendeeEditor from "@/components/toolbox-talks/ToolboxAttendeeEditor";
import type { ToolboxAttendeeRecord } from "@/lib/toolbox-talk-attendees";
import type { ToolboxAttendeeDraft } from "@/lib/toolbox-talk-attendees";

type ToolboxTalk = {
  id: string;
  title: string;
  topic: string | null;
  presenter: string | null;
  department: string | null;
  location: string | null;
  talkDate: string;
  durationMinutes: number | null;
  notes: string | null;
  fileUrl: string | null;
  attendees: (ToolboxAttendeeRecord & { id: string })[];
};

export default function ToolboxTalkViewPage() {
  const params = useParams();
  const id = params.id as string;
  const [talk, setTalk] = useState<ToolboxTalk | null>(null);

  const loadTalk = useCallback(() => {
    if (!id) return;
    fetch(`/api/toolbox-talks/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data?.id) {
          setTalk(null);
          return;
        }
        setTalk(data);
      })
      .catch(() => setTalk(null));
  }, [id]);

  useEffect(() => {
    loadTalk();
  }, [loadTalk]);

  async function addAttendee(attendee: ToolboxAttendeeDraft): Promise<boolean> {
    const res = await fetch(`/api/toolbox-talks/${id}/attendees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(attendee),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? "Failed to add attendee");
      return false;
    }
    loadTalk();
    return true;
  }

  async function removeAttendee(attendeeId: string): Promise<boolean> {
    if (!confirm("Remove this attendee?")) return false;
    const res = await fetch(`/api/toolbox-talks/${id}/attendees/${attendeeId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Failed to remove attendee");
      return false;
    }
    loadTalk();
    return true;
  }

  if (!talk) {
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
          <Link href="/toolbox-talks/list" className="button button-neutral">
            Back to list
          </Link>
          <button
            type="button"
            onClick={() => downloadPdf("toolbox-talk", talk.id)}
            className="button button-neutral"
          >
            Download PDF
          </button>
        </div>
        <div className="p-6 sm:p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 space-y-4">
          <h1 className="text-2xl font-bold text-black">{talk.title}</h1>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="font-semibold text-black/60">Date</dt>
              <dd>{new Date(talk.talkDate).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="font-semibold text-black/60">Topic</dt>
              <dd>{talk.topic ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-black/60">Presenter</dt>
              <dd>{talk.presenter ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-black/60">Department</dt>
              <dd>{talk.department ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-black/60">Location</dt>
              <dd>{talk.location ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-black/60">Duration</dt>
              <dd>{talk.durationMinutes ? `${talk.durationMinutes} min` : "—"}</dd>
            </div>
          </dl>
          {talk.notes && (
            <div>
              <h2 className="font-semibold mb-1">Notes</h2>
              <p className="text-sm text-black/80 whitespace-pre-wrap">{talk.notes}</p>
            </div>
          )}
          {talk.fileUrl && (
            <a
              href={talk.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              View attachment
            </a>
          )}

          <ToolboxAttendeeEditor
            talkId={id}
            attendees={talk.attendees.map((a) => ({
              id: a.id,
              name: a.name,
              surname: a.surname ?? "",
              idNumber: a.idNumber ?? "",
              department: a.department ?? "",
              companyPersonId: a.companyPersonId ?? null,
              signature: a.signature ?? null,
              signedAt: a.signedAt ?? null,
              signToken: a.signToken ?? null,
            }))}
            onAddPersisted={addAttendee}
            onRemovePersisted={removeAttendee}
            onSigned={loadTalk}
          />
        </div>
      </div>
    </div>
  );
}
