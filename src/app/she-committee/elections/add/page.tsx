"use client";

import { useState } from "react";
import Link from "next/link";

export default function AddSHEElectionPage() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      alert("Enter a title.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/she-elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.details || data?.error || "Failed to create");
      window.location.href = `/she-committee/elections/${data.id}`;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-2xl mx-auto space-y-10">
        <Link href="/she-committee/elections" className="text-black/70 hover:text-black">
          ← Elections
        </Link>

        <h1 className="text-4xl font-bold text-black">New SHE Rep Election</h1>
        <p className="text-black/70">Create an election. You will add 2–10 candidates and invite voters next.</p>

        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40"
        >
          <div className="mb-6">
            <label className="block text-sm font-semibold text-black mb-1">Election Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2025 SHE Rep Election"
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button button-save w-full py-3"
          >
            {loading ? "Creating..." : "Create Election"}
          </button>
        </form>
      </div>
    </div>
  );
}
