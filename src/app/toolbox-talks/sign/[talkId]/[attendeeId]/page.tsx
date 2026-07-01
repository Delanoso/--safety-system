"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import SignatureCapture from "@/components/SignatureCapture";

type SignInfo = {
  id: string;
  name: string;
  signed: boolean;
  talk: {
    id: string;
    title: string;
    topic: string | null;
    talkDate: string;
  };
};

function ToolboxSignContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const talkId = params.talkId as string;
  const attendeeId = params.attendeeId as string;
  const token = searchParams.get("token");

  const [info, setInfo] = useState<SignInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No signing token provided. Use the link sent to you.");
      setLoading(false);
      return;
    }
    fetch(
      `/api/toolbox-talks/${talkId}/attendees/${attendeeId}?token=${encodeURIComponent(token)}`
    )
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Invalid link");
        setInfo(data);
      })
      .catch((e) => setError(e.message ?? "Failed to load"))
      .finally(() => setLoading(false));
  }, [talkId, attendeeId, token]);

  async function submitSignature(signature: string) {
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/toolbox-talks/${talkId}/attendees/${attendeeId}/sign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, signature }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save signature");
      setSaved(true);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save signature");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-300">Loading…</p>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-amber-200 max-w-md text-center">{error ?? "Not found"}</p>
      </div>
    );
  }

  if (info.signed || saved) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="max-w-md text-center text-white space-y-2">
          <h1 className="text-2xl font-bold text-green-400">Thank you</h1>
          <p className="text-slate-300">
            Your signature for <strong>{info.talk.title}</strong> has been recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="max-w-lg mx-auto space-y-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Toolbox Talk — Sign attendance</h1>
          <p className="text-slate-300 mt-2">{info.talk.title}</p>
          {info.talk.topic && (
            <p className="text-slate-400 text-sm mt-1">Topic: {info.talk.topic}</p>
          )}
          <p className="text-slate-400 text-sm">
            {new Date(info.talk.talkDate).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
          <p className="text-slate-200 mb-4">
            I, <strong>{info.name}</strong>, confirm I attended this toolbox talk.
          </p>
          <div className="rounded-xl bg-white p-4 text-black">
            <SignatureCapture
              submitting={submitting}
              submitLabel="Confirm attendance"
              onSubmit={submitSignature}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ToolboxAttendeeSignPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-10 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <p className="text-slate-300">Loading…</p>
        </div>
      }
    >
      <ToolboxSignContent />
    </Suspense>
  );
}
