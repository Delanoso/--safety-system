"use client";

import { useState } from "react";
import Link from "next/link";

export default function AddSHECommitteeMeetingPage() {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    agenda: "",
    minutes: "",
    attendees: "",
    actionItems: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const attendees = form.attendees
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const actionItemsRaw = form.actionItems
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const actionItems = actionItemsRaw.map((desc) => ({ description: desc }));

    const res = await fetch("/api/she-meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: form.date,
        agenda: form.agenda.trim() || null,
        minutes: form.minutes.trim() || null,
        attendees: attendees.length ? attendees : null,
        actionItems: actionItems.length ? actionItems : null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "Failed to save");
      return;
    }

    alert("Meeting saved successfully!");
    window.location.href = "/she-committee/meetings";
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-3xl mx-auto space-y-10">
        <Link href="/she-committee/meetings" className="text-black/70 hover:text-black">
          ← Committee Meetings
        </Link>

        <h1 className="text-4xl font-bold text-black">Add Meeting</h1>
        <p className="text-black/70">Record a SHE committee meeting.</p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40"
        >
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Agenda</label>
            <textarea
              name="agenda"
              value={form.agenda}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Minutes</label>
            <textarea
              name="minutes"
              value={form.minutes}
              onChange={handleChange}
              rows={6}
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Attendees (one per line or comma-separated)
            </label>
            <textarea
              name="attendees"
              value={form.attendees}
              onChange={handleChange}
              rows={3}
              placeholder="John Smith, Jane Doe..."
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">
              Action Items (one per line)
            </label>
            <textarea
              name="actionItems"
              value={form.actionItems}
              onChange={handleChange}
              rows={4}
              placeholder="Follow up on incident #123..."
              className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
            />
          </div>

          <button type="submit" className="button button-save w-full py-3">
            Save Meeting
          </button>
        </form>
      </div>
    </div>
  );
}
