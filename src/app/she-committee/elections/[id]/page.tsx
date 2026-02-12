"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LayoutDashboard, Plus, Trash2, Send, RefreshCw } from "lucide-react";

type Candidate = {
  id: string;
  name: string;
  department: string | null;
  _count?: { votes: number };
};

type Voter = {
  id: string;
  email: string | null;
  phone: string | null;
  votedAt: string | null;
};

type Election = {
  id: string;
  title: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  candidates: Candidate[];
  voters: Voter[];
};

export default function SHEElectionDetailPage() {
  const params = useParams() as { id: string };
  const id = params.id as string;
  const [election, setElection] = useState<Election | null>(null);
  const [newCandidate, setNewCandidate] = useState({ name: "", department: "" });
  const [votersInput, setVotersInput] = useState("");
  const [sendingTo, setSendingTo] = useState<string[]>([]);
  const [linksResult, setLinksResult] = useState<{
    linksForManual?: { id: string; phone: string | null; voteUrl: string }[];
    created?: { email?: string; phone?: string; voteUrl: string }[];
  } | null>(null);

  function load() {
    fetch(`/api/she-elections/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setElection(data);
      })
      .catch(() => setElection(null));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function addCandidate(e: React.FormEvent) {
    e.preventDefault();
    if (!newCandidate.name.trim()) return;
    await fetch(`/api/she-elections/${id}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCandidate),
    }).then((r) => r.json()).then((d) => {
      if (d.error) alert(d.error);
      else {
        setNewCandidate({ name: "", department: "" });
        load();
      }
    });
  }

  async function deleteCandidate(candidateId: string) {
    if (!confirm("Remove this candidate?")) return;
    await fetch(`/api/she-elections/${id}/candidates/${candidateId}`, {
      method: "DELETE",
    });
    load();
  }

  async function startVoting() {
    if (!election) return;
    if (election.candidates.length < 2) {
      alert("Add at least 2 candidates before starting voting.");
      return;
    }
    await fetch(`/api/she-elections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "voting_open" }),
    });
    load();
  }

  async function closeVoting() {
    await fetch(`/api/she-elections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "voting_closed" }),
    });
    load();
  }

  async function addVoters(e: React.FormEvent) {
    e.preventDefault();
    const lines = votersInput
      .split(/[\n,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const voters: { email?: string; phone?: string }[] = [];
    for (const line of lines) {
      if (line.includes("@")) voters.push({ email: line });
      else if (/^\d[\d\s-]+$/.test(line)) voters.push({ phone: line.replace(/\s/g, "") });
      else voters.push({ email: line }); // assume email
    }
    if (voters.length === 0) {
      alert("Enter at least one email or phone number (one per line, or comma-separated).");
      return;
    }
    await fetch(`/api/she-elections/${id}/voters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voters }),
    }).then((r) => r.json()).then((d) => {
      if (d.error) alert(d.error);
      else {
        setVotersInput("");
        setLinksResult(d.created ? { created: d.created } : null);
        load();
      }
    });
  }

  async function sendVoteLinks(voterIds: string[]) {
    setSendingTo(voterIds);
    const res = await fetch(`/api/she-elections/${id}/send-vote-links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterIds }),
    });
    const data = await res.json();
    setSendingTo([]);
    if (data.error) alert(data.error);
    else {
      alert(data.message || `Sent to ${data.emailSent} email(s).`);
      if (data.linksForManual?.length) {
        setLinksResult((p) => ({ ...p, linksForManual: data.linksForManual }));
      }
    }
  }

  const votedCount = election?.voters.filter((v) => v.votedAt).length ?? 0;

  if (!election) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
        <div className="max-w-4xl mx-auto">
          <p className="text-black/70">Election not found.</p>
          <Link href="/she-committee/elections" className="text-blue-600 hover:underline mt-4 block">
            ← Back to Elections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/she-committee/elections" className="text-black/70 hover:text-black">
            ← Elections
          </Link>
          <Link href="/dashboard" className="button button-neutral flex items-center gap-2">
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-black">{election.title}</h1>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded font-medium ${
                  election.status === "voting_open"
                    ? "text-green-700 bg-green-100"
                    : election.status === "voting_closed"
                      ? "text-gray-700 bg-gray-200"
                      : "text-amber-700 bg-amber-100"
                }`}
              >
                {election.status === "draft"
                  ? "Draft"
                  : election.status === "voting_open"
                    ? "Voting Open"
                    : "Closed"}
              </span>
              {election.status === "draft" && (
                <button onClick={startVoting} className="button button-save text-sm py-1 px-3">
                  Start Voting
                </button>
              )}
              {election.status === "voting_open" && (
                <button onClick={closeVoting} className="button button-neutral text-sm py-1 px-3">
                  Close Voting
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Candidates */}
        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
          <h2 className="text-lg font-semibold mb-4">
            Candidates ({election.candidates.length}/10)
            {election.status !== "draft" && " — Vote counts"}
          </h2>

          {election.status === "draft" && (
            <form onSubmit={addCandidate} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate((p) => ({ ...p, name: e.target.value }))}
                className="flex-1 p-2 rounded-lg border border-white/40 bg-white/70"
              />
              <input
                type="text"
                placeholder="Department"
                value={newCandidate.department}
                onChange={(e) => setNewCandidate((p) => ({ ...p, department: e.target.value }))}
                className="w-32 p-2 rounded-lg border border-white/40 bg-white/70"
              />
              <button type="submit" className="button button-save px-4">
                <Plus size={18} />
              </button>
            </form>
          )}

          <ul className="space-y-2">
            {election.candidates.map((c) => (
              <li
                key={c.id}
                className="flex justify-between items-center p-3 rounded-lg bg-white/40"
              >
                <span>
                  <strong>{c.name}</strong>
                  {c.department && (
                    <span className="text-black/60 ml-2">({c.department})</span>
                  )}
                  {c._count != null && (
                    <span className="ml-3 text-lg font-bold text-[var(--gold)]">
                      {c._count.votes} vote{c._count.votes !== 1 ? "s" : ""}
                    </span>
                  )}
                </span>
                {election.status === "draft" && (
                  <button
                    onClick={() => deleteCandidate(c.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Voters & Send Links */}
        {(election.status === "voting_open" || election.voters.length > 0) && (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
            <h2 className="text-lg font-semibold mb-4">
              Voters ({votedCount}/{election.voters.length} voted)
            </h2>

            {election.status === "voting_open" && (
              <>
                <form onSubmit={addVoters} className="mb-4">
                  <textarea
                    placeholder="Add voters: one email or phone per line, or comma-separated. e.g.&#10;john@company.com&#10;+27123456789"
                    value={votersInput}
                    onChange={(e) => setVotersInput(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-lg border border-white/40 bg-white/70 mb-2"
                  />
                  <button type="submit" className="button button-save">
                    Add Voters & Generate Links
                  </button>
                </form>

                {election.voters.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() =>
                        sendVoteLinks(
                          election.voters.filter((v) => !v.votedAt).map((v) => v.id)
                        )
                      }
                      disabled={sendingTo.length > 0}
                      className="button button-save flex items-center gap-2 mb-4"
                    >
                      <Send size={18} />
                      {sendingTo.length > 0
                        ? "Sending..."
                        : "Send vote links via email to all who have not voted"}
                    </button>
                  </div>
                )}
              </>
            )}

            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {election.voters.map((v) => (
                <li
                  key={v.id}
                  className="flex justify-between items-center p-2 rounded bg-white/40 text-sm"
                >
                  <span>
                    {v.email || v.phone || "—"}{" "}
                    {v.votedAt && (
                      <span className="text-green-600 font-medium">✓ Voted</span>
                    )}
                  </span>
                  {election.status === "voting_open" && !v.votedAt && (
                    <button
                      onClick={() => sendVoteLinks([v.id])}
                      disabled={sendingTo.includes(v.id)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Send link
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {(linksResult?.linksForManual?.length || linksResult?.created?.length) && (
              <div className="mt-4 p-4 rounded-lg bg-amber-50/50 border border-amber-200">
                <p className="font-semibold mb-2">
                  Copy links to send via email, SMS or WhatsApp:
                </p>
                <ul className="space-y-2 text-sm">
                  {((linksResult.linksForManual || linksResult.created) ?? []).map((l, i) => (
                    <li key={i} className="flex flex-wrap gap-2 items-center">
                      <span className="text-black/70 shrink-0">
                        {[l.email, l.phone].filter(Boolean).join(" · ") || "—"}
                      </span>
                      <code className="bg-white/80 px-2 py-1 rounded break-all max-w-full">
                        {l.voteUrl}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={load} className="button button-neutral flex items-center gap-2">
            <RefreshCw size={18} />
            Refresh results
          </button>
        </div>
      </div>
    </div>
  );
}
