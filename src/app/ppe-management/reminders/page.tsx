"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Person = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  department: string | null;
  subDepartment: string | null;
  subDepartmentId: number | null;
  sizes: string | null;
  subDepartmentRelation?: {
    id: number;
    ppeItemTypes?: { itemType: { id: number; name: string } }[];
  } | null;
};

type Department = { id: number; name: string };
type SubDept = { id: number; name: string; departmentId: number };

function parseSizes(sizes: string | null): Record<string, string> {
  if (!sizes) return {};
  try {
    const obj = JSON.parse(sizes);
    return typeof obj === "object" && obj !== null ? (obj as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function personMissingRequiredSizes(p: Person): boolean {
  const rel = p.subDepartmentRelation;
  const requiredItems = rel?.ppeItemTypes ?? [];
  if (requiredItems.length === 0) {
    // No required PPE configured for this sub-department → nothing to chase
    return false;
  }
  const sizes = parseSizes(p.sizes);
  return requiredItems.some(({ itemType }) => {
    const v = sizes[itemType.name];
    return !v || String(v).trim() === "";
  });
}

export default function RemindersPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<SubDept[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDeptId, setFilterDeptId] = useState<number | "">("");
  const [filterSubId, setFilterSubId] = useState<number | "">("");
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [linkForId, setLinkForId] = useState<number | null>(null);
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/ppe/persons").then((r) => r.json()),
      fetch("/api/ppe/departments").then((r) => r.json()),
    ])
      .then(([people, depts]) => {
        setPersons(Array.isArray(people) ? people : []);
        setDepartments(Array.isArray(depts) ? depts : []);
      })
      .catch(() => {
        setPersons([]);
        setDepartments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!filterDeptId) {
      setSubDepartments([]);
      setFilterSubId("");
      return;
    }
    fetch(`/api/ppe/departments/${filterDeptId}/sub-departments`)
      .then((r) => r.json())
      .then((subs) => setSubDepartments(Array.isArray(subs) ? subs : []))
      .catch(() => setSubDepartments([]));
    setFilterSubId("");
  }, [filterDeptId]);

  const base = persons.filter(personMissingRequiredSizes);

  const filtered = base.filter((p) => {
    if (filterSubId) return p.subDepartmentId === filterSubId;
    if (filterDeptId) {
      const sub = subDepartments.find((s) => s.id === p.subDepartmentId);
      return sub?.departmentId === filterDeptId;
    }
    return true;
  });

  function stripPhone(phone: string | null): string {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
  }

  function sendWhatsAppReminder(p: Person) {
    setSendingId(p.id);
    fetch("/api/ppe/reminder-tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId: p.id }),
    })
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d))))
      .then((res: { link: string; personName: string; phone: string | null }) => {
        const message = `Hi ${res.personName}, please submit your PPE sizes here: ${res.link}`;
        const digits = stripPhone(res.phone ?? p.phone);
        if (digits) {
          const waUrl = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
          window.open(waUrl, "_blank");
        } else {
          setLinkUrl(res.link);
          setLinkForId(p.id);
        }
      })
      .catch((err) => alert(err?.error || "Failed to create reminder link."))
      .finally(() => setSendingId(null));
  }

  function copyLink(p: Person) {
    setSendingId(p.id);
    fetch("/api/ppe/reminder-tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personId: p.id }),
    })
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d))))
      .then((res: { link: string }) => {
        setLinkUrl(res.link);
        setLinkForId(p.id);
        navigator.clipboard.writeText(res.link).then(() => alert("Link copied to clipboard."));
      })
      .catch((err) => alert(err?.error || "Failed to create reminder link."))
      .finally(() => setSendingId(null));
  }

  if (loading) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link href="/ppe-management" className="text-black/70 hover:underline text-sm block mb-1">
            ← PPE Management
          </Link>
          <h1 className="text-4xl font-bold text-black">PPE size reminders</h1>
          <p className="text-black/70 mt-1">
            Send a link via WhatsApp so people can open it and choose their PPE sizes (based on their sub-department).
          </p>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4 flex flex-wrap gap-4 items-center">
          <span className="font-medium text-black">Filter:</span>
          <select
            value={filterDeptId}
            onChange={(e) => setFilterDeptId(e.target.value ? Number(e.target.value) : "")}
            className="p-2 rounded-lg border border-white/40 bg-white/70 text-black"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={filterSubId}
            onChange={(e) => setFilterSubId(e.target.value ? Number(e.target.value) : "")}
            className="p-2 rounded-lg border border-white/40 bg-white/70 text-black"
            disabled={!filterDeptId}
          >
            <option value="">All sub-departments</option>
            {subDepartments.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {linkForId !== null && linkUrl && (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-4">
            <p className="text-sm text-black/80 mb-2">No phone number — copy link and send manually:</p>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                readOnly
                value={linkUrl}
                className="flex-1 min-w-[200px] p-2 rounded-lg border bg-white/80 text-black text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(linkUrl);
                  alert("Copied.");
                }}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => { setLinkForId(null); setLinkUrl(""); }}
                className="px-3 py-2 rounded-lg bg-gray-300 text-black text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/40">
                <th className="p-4 font-semibold text-black">Name</th>
                <th className="p-4 font-semibold text-black">Department / Sub</th>
                <th className="p-4 font-semibold text-black">Phone</th>
                <th className="p-4 font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-black/60">
                    No people match the filter. Add people in the PPE Size List, assign a sub-department with PPE items, and capture missing sizes.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-t border-white/40">
                    <td className="p-4 font-medium text-black">{p.name}</td>
                    <td className="p-4 text-black/80">{p.department ?? "—"} / {p.subDepartment ?? "—"}</td>
                    <td className="p-4 text-black/80">{p.phone ?? "—"}</td>
                    <td className="p-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => sendWhatsAppReminder(p)}
                        disabled={sendingId === p.id}
                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        {sendingId === p.id ? "…" : "Send via WhatsApp"}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyLink(p)}
                        disabled={sendingId === p.id}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        Copy link
                      </button>
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
