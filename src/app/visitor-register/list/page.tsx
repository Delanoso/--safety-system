"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { downloadPdf } from "@/lib/pdf-download";

type Visitor = {
  id: string;
  visitorName: string;
  visitorCompany: string | null;
  hostName: string;
  purpose: string | null;
  checkInAt: string;
  checkOutAt: string | null;
};

export default function VisitorRegisterListPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filter, setFilter] = useState<"all" | "onSite">("all");
  const [search, setSearch] = useState("");

  async function load() {
    const url = filter === "onSite" ? "/api/visitor-register?onSite=true" : "/api/visitor-register";
    const res = await fetch(url);
    const data = await res.json();
    setVisitors(Array.isArray(data) ? data : []);
  }

  useEffect(() => { load(); }, [filter]);

  async function checkOut(id: string) {
    await fetch(`/api/visitor-register/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "checkout" }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this visitor record?")) return;
    await fetch(`/api/visitor-register/${id}`, { method: "DELETE" });
    load();
  }

  function formatDt(d: string) {
    return new Date(d).toLocaleString();
  }

  const filtered = visitors.filter((v) => {
    const term = search.toLowerCase();
    return (
      v.visitorName.toLowerCase().includes(term) ||
      v.hostName.toLowerCase().includes(term) ||
      (v.visitorCompany ?? "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Visitor Log</h1>
          <div className="flex gap-2">
            <Link href="/visitor-register/add" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Check In</Link>
            <Link href="/visitor-register" className="button button-neutral">Back</Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setFilter("all")} className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-orange-600 text-white" : "bg-white/70"}`}>All</button>
          <button type="button" onClick={() => setFilter("onSite")} className={`px-4 py-2 rounded-lg ${filter === "onSite" ? "bg-orange-600 text-white" : "bg-white/70"}`}>On site now</button>
        </div>
        <input type="text" placeholder="Search visitor or host..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
        <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead>
              <tr className="bg-white/40">
                <th className="p-3 font-semibold">Visitor</th>
                <th className="p-3 font-semibold">Company</th>
                <th className="p-3 font-semibold">Host</th>
                <th className="p-3 font-semibold">Purpose</th>
                <th className="p-3 font-semibold">Check in</th>
                <th className="p-3 font-semibold">Check out</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-4 text-center text-black/60">No visitors found.</td></tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v.id} className="border-t border-white/40">
                    <td className="p-3">{v.visitorName}</td>
                    <td className="p-3">{v.visitorCompany ?? "—"}</td>
                    <td className="p-3">{v.hostName}</td>
                    <td className="p-3">{v.purpose ?? "—"}</td>
                    <td className="p-3">{formatDt(v.checkInAt)}</td>
                    <td className="p-3">{v.checkOutAt ? formatDt(v.checkOutAt) : <span className="text-green-700 font-medium">On site</span>}</td>
                    <td className="p-3 flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => downloadPdf("visitor-register", v.id)}
                        className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
                      >
                        PDF
                      </button>
                      {!v.checkOutAt && (
                        <button type="button" onClick={() => checkOut(v.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700">Check out</button>
                      )}
                      <button type="button" onClick={() => handleDelete(v.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
