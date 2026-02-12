"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

type Candidate = {
  id: string;
  name: string;
  department: string | null;
  _count: { votes: number };
};

type Election = {
  id: string;
  title: string;
  status: string;
  candidates: Candidate[];
};

export default function SHEVotePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const electionId = params.electionId as string;
  const token = searchParams.get("token");

  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    if (!electionId || !token) {
      setError("Invalid voting link. Missing election or token.");
      setLoading(false);
      return;
    }

    fetch(`/api/she-elections/vote?electionId=${encodeURIComponent(electionId)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        if (data.alreadyVoted) {
          setVoted(true);
          setElection(data.election);
        } else {
          setElection(data.election);
        }
      })
      .catch((e) => setError(e?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [electionId, token]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !token) return;
    setSubmitting(true);

    fetch("/api/she-elections/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        electionId,
        token,
        candidateId: selectedId,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setVoted(true);
        if (election) {
          setElection({
            ...election,
            candidates: election.candidates.map((c) =>
              c.id === selectedId
                ? { ...c, _count: { votes: c._count.votes + 1 } }
                : c
            ),
          });
        }
      })
      .catch((e) => alert(e?.message || "Failed to submit vote"))
      .finally(() => setSubmitting(false));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-200 to-purple-300">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-200 to-purple-300 p-6">
        <div className="max-w-md w-full bg-white/80 rounded-2xl p-8 shadow-xl text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Invalid Link</h1>
          <p className="text-black/70">{error}</p>
        </div>
      </div>
    );
  }

  if (!election) return null;

  if (election.status !== "voting_open" && !voted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-200 to-purple-300 p-6">
        <div className="max-w-md w-full bg-white/80 rounded-2xl p-8 shadow-xl text-center">
          <h1 className="text-xl font-bold text-black mb-2">{election.title}</h1>
          <p className="text-black/70">Voting is currently closed.</p>
        </div>
      </div>
    );
  }

  if (voted) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-r from-blue-200 to-purple-300">
        <div className="max-w-2xl mx-auto bg-white/80 rounded-2xl p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-black mb-2">Thank you for voting!</h1>
          <p className="text-black/70 mb-6">Your vote has been recorded for {election.title}.</p>
          <h2 className="text-lg font-semibold mb-4">Current Results</h2>
          <div className="space-y-3">
            {election.candidates
              .sort((a, b) => b._count.votes - a._count.votes)
              .map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-white/60"
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-lg font-bold text-[var(--gold)]">
                    {c._count.votes} vote{c._count.votes !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-2xl mx-auto bg-white/80 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-black mb-2">{election.title}</h1>
        <p className="text-black/70 mb-6">Select one candidate to vote for SHE Rep.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {election.candidates.map((c) => (
            <label
              key={c.id}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                selectedId === c.id
                  ? "border-[var(--gold)] bg-amber-50/50"
                  : "border-white/60 bg-white/40 hover:border-black/20"
              }`}
            >
              <input
                type="radio"
                name="candidate"
                value={c.id}
                checked={selectedId === c.id}
                onChange={() => setSelectedId(c.id)}
                className="w-5 h-5"
              />
              <div>
                <span className="font-semibold">{c.name}</span>
                {c.department && (
                  <span className="text-black/60 ml-2">({c.department})</span>
                )}
              </div>
            </label>
          ))}

          <button
            type="submit"
            disabled={!selectedId || submitting}
            className="w-full py-3 mt-6 rounded-xl bg-[var(--gold)] text-black font-semibold hover:brightness-110 transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Vote"}
          </button>
        </form>
      </div>
    </div>
  );
}
