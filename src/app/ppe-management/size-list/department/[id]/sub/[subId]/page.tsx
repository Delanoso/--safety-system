"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Person = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  subDepartment: string | null;
  sizes: string | null;
};

type SubDepartment = {
  id: number;
  name: string;
  department: { id: number; name: string };
  persons: Person[];
  ppeItemTypes?: { itemType: { id: number; name: string } }[];
};

const PPE_SIZE_ITEMS = [
  "Overall", "Conti Suit Pants", "Conti Suit Top", "Dust Coat", "Apron", "Hard Hat",
  "Gum Boots", "Safety Shoes", "Gloves", "Safety Goggles", "Face Shield", "Welding Hood",
  "Self Cont. Respirator", "Respirator", "Dust Mask", "Hearing Protection", "Safety Belt",
  "Thermal Suit", "Thermal Jacket", "Jersey", "Socks", "T-Shirt", "Golf Shirt", "Pants",
];

function parseSizes(s: string | null): Record<string, string> {
  if (!s) return {};
  try {
    const o = JSON.parse(s);
    return typeof o === "object" && o ? o : {};
  } catch {
    return {};
  }
}

export default function SubDepartmentPeoplePage() {
  const params = useParams();
  const id = params.id as string;
  const subId = params.subId as string;
  const [sub, setSub] = useState<SubDepartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [sizeEntries, setSizeEntries] = useState<Record<string, string>>({});
  const [newSizeItem, setNewSizeItem] = useState("");
  const [newSizeValue, setNewSizeValue] = useState("");
  const [showEditSub, setShowEditSub] = useState(false);
  const [editSubName, setEditSubName] = useState("");
  const [editSubItemTypeIds, setEditSubItemTypeIds] = useState<number[]>([]);
  const [allItemTypes, setAllItemTypes] = useState<{ id: number; name: string }[]>([]);

  function load() {
    fetch(`/api/ppe/sub-departments/${subId}`)
      .then((r) => r.json())
      .then(setSub)
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (subId) load();
  }, [subId]);

  useEffect(() => {
    fetch("/api/ppe/item-types")
      .then((r) => r.json())
      .then((list: { id: number; name: string }[]) => setAllItemTypes(list))
      .catch(() => setAllItemTypes([]));
  }, []);

  function openEditSub() {
    if (!sub) return;
    setEditSubName(sub.name);
    setEditSubItemTypeIds((sub.ppeItemTypes ?? []).map((x) => x.itemType.id));
    setShowEditSub(true);
  }

  function handleSaveEditSub(e: React.FormEvent) {
    e.preventDefault();
    const name = editSubName.trim();
    if (!name) return;
    fetch(`/api/ppe/sub-departments/${subId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ppeItemTypeIds: editSubItemTypeIds }),
    })
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d))))
      .then(() => {
        setShowEditSub(false);
        load();
      })
      .catch((err) => alert(err?.error || "Failed to update sub-department."));
  }

  const availableSizeItems = PPE_SIZE_ITEMS.filter((item) => !(item in sizeEntries));

  function handleAddSize() {
    if (!newSizeItem || !newSizeValue.trim()) return;
    setSizeEntries((prev) => ({ ...prev, [newSizeItem]: newSizeValue.trim() }));
    setNewSizeItem("");
    setNewSizeValue("");
  }

  function handleRemoveSize(item: string) {
    setSizeEntries((prev) => {
      const next = { ...prev };
      delete next[item];
      return next;
    });
  }

  function handleAddPerson(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    const sizesJson = Object.keys(sizeEntries).length > 0 ? JSON.stringify(sizeEntries) : null;
    fetch(`/api/ppe/sub-departments/${subId}/persons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        sizes: sizesJson,
      }),
    })
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d))))
      .then(() => {
        setForm({ name: "", phone: "", email: "" });
        setSizeEntries({});
        setNewSizeItem("");
        setNewSizeValue("");
        setShowAdd(false);
        load();
      })
      .catch((err) => alert(err?.error || "Failed to add person."));
  }

  function handleRemovePerson(personId: number, name: string) {
    if (!confirm(`Remove ${name} from this sub-department?`)) return;
    fetch(`/api/ppe/persons/${personId}`, { method: "DELETE" }).then(() => load());
  }

  function startEdit(p: Person) {
    setEditingId(p.id);
    setForm({ name: p.name, phone: p.phone ?? "", email: p.email ?? "" });
    setSizeEntries(parseSizes(p.sizes));
    setNewSizeItem("");
    setNewSizeValue("");
  }

  function handleUpdatePerson(e: React.FormEvent, personId: number) {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    const sizesJson = Object.keys(sizeEntries).length > 0 ? JSON.stringify(sizeEntries) : null;
    fetch(`/api/ppe/persons/${personId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        sizes: sizesJson,
      }),
    })
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d))))
      .then(() => {
        setEditingId(null);
        setForm({ name: "", phone: "", email: "" });
        setSizeEntries({});
        load();
      })
      .catch((err) => alert(err?.error || "Failed to update."));
  }

  if (loading || !sub) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <p className="text-black/70">{loading ? "Loading..." : "Sub-department not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link href="/ppe-management/size-list" className="text-black/70 hover:underline text-sm block mb-1">
              ← PPE Size List
            </Link>
            <Link href={`/ppe-management/size-list/department/${id}`} className="text-black/70 hover:underline text-sm block mb-1">
              {sub.department.name}
            </Link>
            <h1 className="text-4xl font-bold text-black">{sub.name}</h1>
            <p className="text-black/70 mt-1">Add or remove people. Set their contact details and PPE sizes.</p>
            {sub.ppeItemTypes && sub.ppeItemTypes.length > 0 && (
              <p className="text-sm text-black/60 mt-1">PPE items for reminders: {sub.ppeItemTypes.map((x) => x.itemType.name).join(", ")}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openEditSub}
              className="px-4 py-2 rounded-xl bg-gray-600 text-white font-semibold hover:bg-gray-700 transition"
            >
              Edit sub-department
            </button>
            <button
            onClick={() => {
              setShowAdd(true);
              setForm({ name: "", phone: "", email: "" });
              setSizeEntries({});
              setNewSizeItem("");
              setNewSizeValue("");
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Add person
          </button>
          </div>
        </div>

        {showEditSub && (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
            <h2 className="text-xl font-bold text-black mb-4">Edit sub-department</h2>
            <form onSubmit={handleSaveEditSub} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Name</label>
                <input
                  type="text"
                  value={editSubName}
                  onChange={(e) => setEditSubName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70 text-black"
                  required
                />
              </div>
              {allItemTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">PPE items for size reminders</label>
                  <div className="flex flex-wrap gap-2">
                    {allItemTypes.map((it) => (
                      <label key={it.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 border border-white/40 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editSubItemTypeIds.includes(it.id)}
                          onChange={() => setEditSubItemTypeIds((prev) => prev.includes(it.id) ? prev.filter((x) => x !== it.id) : [...prev, it.id])}
                          className="rounded"
                        />
                        <span className="text-sm text-black">{it.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Save</button>
                <button type="button" onClick={() => setShowEditSub(false)} className="px-4 py-2 rounded-lg bg-gray-300 text-black hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {showAdd && (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
            <h2 className="text-xl font-bold text-black mb-4">Add person</h2>
            <form onSubmit={handleAddPerson} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. 072 333 1204"
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="optional"
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">PPE sizes (item + value)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.entries(sizeEntries).map(([item, value]) => (
                    <span key={item} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                      {item}: {value}
                      <button type="button" onClick={() => handleRemoveSize(item)} className="ml-1 hover:text-blue-900">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={newSizeItem}
                    onChange={(e) => setNewSizeItem(e.target.value)}
                    className="p-2 rounded-lg border border-white/40 bg-white/70 text-black min-w-[180px]"
                  >
                    <option value="">Select item…</option>
                    {availableSizeItems.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newSizeValue}
                    onChange={(e) => setNewSizeValue(e.target.value)}
                    placeholder="Size (e.g. 8, M, L)"
                    className="p-2 rounded-lg border border-white/40 bg-white/70 min-w-[140px]"
                  />
                  <button type="button" onClick={handleAddSize} className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700">
                    Add size
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Save</button>
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg bg-gray-300 text-black hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/40">
                <th className="p-4 font-semibold text-black">Name</th>
                <th className="p-4 font-semibold text-black">Phone</th>
                <th className="p-4 font-semibold text-black">Email</th>
                <th className="p-4 font-semibold text-black">Sizes</th>
                <th className="p-4 font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sub.persons.length === 0 && !showAdd && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-black/60">
                    No people yet. Click "Add person" to add someone with contact details and PPE sizes.
                  </td>
                </tr>
              )}
              {sub.persons.map((p) => (
                <tr key={p.id} className="border-t border-white/40">
                  {editingId === p.id ? (
                    <>
                      <td colSpan={5} className="p-4 bg-white/50">
                        <form onSubmit={(e) => handleUpdatePerson(e, p.id)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" className="p-2 rounded border bg-white/80" required />
                          <input type="text" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="p-2 rounded border bg-white/80" />
                          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" className="p-2 rounded border bg-white/80" />
                          <div className="md:col-span-2 flex flex-wrap gap-2 items-center">
                            {Object.entries(sizeEntries).map(([item, value]) => (
                              <span key={item} className="px-2 py-1 rounded bg-blue-100 text-xs">
                                {item}: {value}
                                <button type="button" onClick={() => handleRemoveSize(item)} className="ml-1">×</button>
                              </span>
                            ))}
                            <select value={newSizeItem} onChange={(e) => setNewSizeItem(e.target.value)} className="p-2 rounded border bg-white/80 min-w-[140px]">
                              <option value="">Add size…</option>
                              {availableSizeItems.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                            <input type="text" value={newSizeValue} onChange={(e) => setNewSizeValue(e.target.value)} placeholder="Value" className="p-2 rounded border bg-white/80 w-20" />
                            <button type="button" onClick={handleAddSize} className="px-2 py-1 rounded bg-green-600 text-white text-sm">Add</button>
                          </div>
                          <div className="md:col-span-2 flex gap-2">
                            <button type="submit" className="px-3 py-1 rounded bg-green-600 text-white">Save</button>
                            <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 rounded bg-gray-300 text-black">Cancel</button>
                          </div>
                        </form>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 font-medium text-black">{p.name}</td>
                      <td className="p-4 text-black/80">{p.phone ?? "—"}</td>
                      <td className="p-4 text-black/80">{p.email ?? "—"}</td>
                      <td className="p-4 text-black/80">
                        {Object.entries(parseSizes(p.sizes)).length
                          ? Object.entries(parseSizes(p.sizes)).map(([k, v]) => `${k}: ${v}`).join(", ")
                          : "—"}
                      </td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => startEdit(p)} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Edit</button>
                        <button onClick={() => handleRemovePerson(p.id, p.name)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Remove</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
