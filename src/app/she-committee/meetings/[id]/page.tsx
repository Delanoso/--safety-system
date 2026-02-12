"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Meeting = {
  id: string;
  date: string;
  agenda: string | null;
  minutes: string | null;
  attendees: string | null;
  actionItems: string | null;
};

export default function SHECommitteeMeetingViewPage() {
  const params = useParams();
  const id = params.id as string;
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/she-meetings/${id}`);
      if (!res.ok) {
        setMeeting(null);
        return;
      }
      const data = await res.json();
      setMeeting(data);
    }
    load();
  }, [id]);

  if (!meeting) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
        <div className="max-w-3xl mx-auto">
          <p className="text-black/70">Meeting not found.</p>
          <Link href="/she-committee/meetings" className="text-blue-600 hover:underline mt-4 block">
            ← Back to Meetings
          </Link>
        </div>
      </div>
    );
  }

  let attendees: string[] = [];
  try {
    attendees = meeting.attendees ? JSON.parse(meeting.attendees) : [];
  } catch {
    attendees = [];
  }

  let actionItems: { description?: string }[] = [];
  try {
    actionItems = meeting.actionItems ? JSON.parse(meeting.actionItems) : [];
  } catch {
    actionItems = [];
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-3xl mx-auto space-y-10">
        <Link href="/she-committee/meetings" className="text-black/70 hover:text-black">
          ← Committee Meetings
        </Link>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-8 space-y-6">
          <div className="border-b border-black/10 pb-4">
            <h1 className="text-2xl font-bold text-black">
              Meeting — {new Date(meeting.date).toLocaleDateString()}
            </h1>
          </div>

          {meeting.agenda && (
            <div>
              <h2 className="text-lg font-semibold text-black mb-2">Agenda</h2>
              <p className="text-black/80 whitespace-pre-wrap">{meeting.agenda}</p>
            </div>
          )}

          {meeting.minutes && (
            <div>
              <h2 className="text-lg font-semibold text-black mb-2">Minutes</h2>
              <p className="text-black/80 whitespace-pre-wrap">{meeting.minutes}</p>
            </div>
          )}

          {attendees.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-black mb-2">Attendees</h2>
              <ul className="list-disc list-inside space-y-1 text-black/80">
                {attendees.map((a: string, i: number) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {actionItems.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-black mb-2">Action Items</h2>
              <ul className="list-disc list-inside space-y-1 text-black/80">
                {actionItems.map((item: { description?: string }, i: number) => (
                  <li key={i}>{item.description ?? ""}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
