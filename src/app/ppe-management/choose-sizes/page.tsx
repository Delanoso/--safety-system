"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ChooseSizesContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personName, setPersonName] = useState("");
  const [items, setItems] = useState<{ id: number; name: string }[]>([]);
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Missing link. Use the link sent to you.");
      setLoading(false);
      return;
    }
    fetch(`/api/ppe/choose-sizes?token=${encodeURIComponent(token)}`)
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        return r.json();
      })
      .then((data: { personName: string; items: { id: number; name: string }[] }) => {
        setPersonName(data.personName ?? "");
        setItems(Array.isArray(data.items) ? data.items : []);
        setSizes(
          Object.fromEntries(
            (data.items ?? []).map((it: { name: string }) => [it.name, ""])
          )
        );
      })
      .catch((err) => setError(err?.error ?? "Invalid or expired link."))
      .finally(() => setLoading(false));
  }, [token]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    fetch("/api/ppe/choose-sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, sizes }),
    })
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d))))
      .then(() => setDone(true))
      .catch((err) => alert(err?.error ?? "Failed to save."))
      .finally(() => setSubmitting(false));
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6 max-w-md text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <p className="text-black/70 text-sm mt-2">Request a new link from your supervisor if needed.</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6 max-w-md text-center">
          <p className="text-green-700 font-semibold text-lg">Sizes saved.</p>
          <p className="text-black/70 mt-2">Thank you. You can close this page.</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6 max-w-md text-center">
          <p className="text-black font-medium">No PPE items to choose</p>
          <p className="text-black/70 text-sm mt-2">Your sub-department has no PPE items configured. Contact your supervisor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-lg mx-auto">
        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
          <h1 className="text-2xl font-bold text-black">Choose your PPE sizes</h1>
          <p className="text-black/70 mt-1">Hi {personName}, enter your size for each item below.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {items.map((it) => (
              <div key={it.id}>
                <label className="block text-sm font-semibold text-black mb-1">{it.name}</label>
                <input
                  type="text"
                  value={sizes[it.name] ?? ""}
                  onChange={(e) => setSizes((prev) => ({ ...prev, [it.name]: e.target.value }))}
                  placeholder="e.g. M, 42, L"
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70 text-black"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save sizes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ChooseSizesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-6 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <p className="text-black/70">Loading...</p>
      </div>
    }>
      <ChooseSizesContent />
    </Suspense>
  );
}
