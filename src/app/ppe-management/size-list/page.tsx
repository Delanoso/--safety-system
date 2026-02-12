"use client";

import { useEffect, useState } from "react";

type PPEPerson = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  subDepartment: string | null;
  sizes: string | null;
  createdAt: string;
};

const PPE_SIZE_ITEMS = [
  "Overall",
  "Conti Suit Pants",
  "Conti Suit Top",
  "Dust Coat",
  "Apron",
  "Hard Hat",
  "Gum Boots",
  "Safety Shoes",
  "Gloves",
  "Safety Goggles",
  "Face Shield",
  "Welding Hood",
  "Self Cont. Respirator",
  "Respirator",
  "Dust Mask",
  "Hearing Protection",
  "Safety Belt",
  "Thermal Suit",
  "Thermal Jacket",
  "Jersey",
  "Socks",
  "T-Shirt",
  "Golf Shirt",
  "Pants",
];

export default function PPESizeListPage() {
  const [persons, setPersons] = useState<PPEPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", department: "", subDepartment: "" });
  const [sizeEntries, setSizeEntries] = useState<Record<string, string>>({});
  const [newSizeItem, setNewSizeItem] = useState("");
  const [newSizeValue, setNewSizeValue] = useState("");

  function load() {
    fetch("/api/ppe/persons")
      .then((r) => r.json())
      .then(setPersons)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function parseSizes(s: string | null): Record<string, string> {
    if (!s) return {};
    try {
      const o = JSON.parse(s);
      return typeof o === "object" && o ? o : {};
    } catch {
      return {};
    }
  }

  function stringifySizes(o: Record<string, string>): string {
    return JSON.stringify(o);
  }

  const availableSizeItems = PPE_SIZE_ITEMS.filter(
    (item) => !(item in sizeEntries)
  );

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

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const sizesJson =
      Object.keys(sizeEntries).length > 0 ? stringifySizes(sizeEntries) : null;
    const payload = {
      name: form.name.trim(),
      department: form.department.trim() || null,
      subDepartment: form.subDepartment.trim() || null,
      sizes: sizesJson,
    };
    if (!payload.name) return;
    fetch("/api/ppe/persons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        return r.json();
      })
      .then(() => {
        setForm({ name: "", department: "", subDepartment: "" });
        setSizeEntries({});
        setNewSizeItem("");
        setNewSizeValue("");
        setShowAdd(false);
        load();
      })
      .catch((err) => alert(err?.error || "Failed to add person."));
  }

  function handleUpdate(e: React.FormEvent, id: number) {
    e.preventDefault();
    const sizesJson =
      Object.keys(sizeEntries).length > 0 ? stringifySizes(sizeEntries) : null;
    const payload = {
      name: form.name.trim(),
      department: form.department.trim() || null,
      subDepartment: form.subDepartment.trim() || null,
      sizes: sizesJson,
    };
    if (!payload.name) return;
    fetch(`/api/ppe/persons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        return r.json();
      })
      .then(() => {
        setEditingId(null);
        load();
      })
      .catch((err) => alert(err?.error || "Failed to update."));
  }

  function handleDelete(id: number) {
    if (!confirm("Remove this person from the list?")) return;
    fetch(`/api/ppe/persons/${id}`, { method: "DELETE" }).then(() => load());
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
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black">PPE Size List</h1>
            <p className="text-black/70 mt-1">Add and edit people and their PPE sizes.</p>
          </div>
          <button
            onClick={() => {
              setShowAdd(true);
              setForm({ name: "", department: "", subDepartment: "" });
              setSizeEntries({});
              setNewSizeItem("");
              setNewSizeValue("");
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Add Person
          </button>
        </div>

        {showAdd && (
          <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
            <h2 className="text-xl font-bold text-black mb-4">Add Person</h2>
            <form onSubmit={handleAdd} className="space-y-4">
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
                <label className="block text-sm font-semibold text-black mb-1">Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">Sub-department</label>
                <input
                  type="text"
                  value={form.subDepartment}
                  onChange={(e) => setForm((f) => ({ ...f, subDepartment: e.target.value }))}
                  className="w-full p-3 rounded-lg border border-white/40 bg-white/70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-1">
                  Sizes (select item and add size; only items with a size will be shown)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.entries(sizeEntries).length ? (
                    Object.entries(sizeEntries).map(([item, value]) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs"
                      >
                        {item}: {value}
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(item)}
                          className="ml-1 text-blue-800 hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-black/50 text-sm">No sizes added yet.</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={newSizeItem}
                    onChange={(e) => setNewSizeItem(e.target.value)}
                    className="p-2 rounded-lg border border-white/40 bg-white/70 text-black min-w-[180px]"
                  >
                    <option value="">Select item…</option>
                    {availableSizeItems.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newSizeValue}
                    onChange={(e) => setNewSizeValue(e.target.value)}
                    placeholder="Size (e.g. 8, M, L)"
                    className="p-2 rounded-lg border border-white/40 bg-white/70 min-w-[140px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
                  >
                    Add size
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
                  Save
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg bg-gray-300 text-black hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/40">
                <th className="p-4 font-semibold text-black">Name</th>
                <th className="p-4 font-semibold text-black">Department</th>
                <th className="p-4 font-semibold text-black">Sub-department</th>
                <th className="p-4 font-semibold text-black">Sizes</th>
                <th className="p-4 font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {persons.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-black/60">
                    No people yet. Add someone from the size list to use them in the Issue Register.
                  </td>
                </tr>
              )}
              {persons.map((p) => (
                <tr key={p.id} className="border-t border-white/40">
                  {editingId === p.id ? (
                    <>
                      <td colSpan={5} className="p-4">
                        <form onSubmit={(e) => handleUpdate(e, p.id)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Name"
                            className="p-2 rounded border bg-white/80"
                            required
                          />
                          <input
                            type="text"
                            value={form.department}
                            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                            placeholder="Department"
                            className="p-2 rounded border bg-white/80"
                          />
                          <input
                            type="text"
                            value={form.subDepartment}
                            onChange={(e) => setForm((f) => ({ ...f, subDepartment: e.target.value }))}
                            placeholder="Sub-department"
                            className="p-2 rounded border bg-white/80"
                          />
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-black mb-1">
                              Sizes
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {Object.entries(sizeEntries).length ? (
                                Object.entries(sizeEntries).map(([item, value]) => (
                                  <span
                                    key={item}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs"
                                  >
                                    {item}: {value}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSize(item)}
                                      className="ml-1 text-blue-800 hover:text-blue-900"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))
                              ) : (
                                <span className="text-black/50 text-xs">No sizes set.</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <select
                                value={newSizeItem}
                                onChange={(e) => setNewSizeItem(e.target.value)}
                                className="p-2 rounded border bg-white/80 min-w-[160px]"
                              >
                                <option value="">Select item…</option>
                                {availableSizeItems.map((item) => (
                                  <option key={item} value={item}>
                                    {item}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={newSizeValue}
                                onChange={(e) => setNewSizeValue(e.target.value)}
                                placeholder="Size"
                                className="p-2 rounded border bg-white/80 min-w-[120px]"
                              />
                              <button
                                type="button"
                                onClick={handleAddSize}
                                className="px-3 py-1 rounded bg-green-600 text-white text-xs"
                              >
                                Add size
                              </button>
                            </div>
                          </div>
                          <div className="md:col-span-2 flex gap-2">
                            <button type="submit" className="px-3 py-1 rounded bg-green-600 text-white">Save</button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setSizeEntries({});
                                setNewSizeItem("");
                                setNewSizeValue("");
                              }}
                              className="px-3 py-1 rounded bg-gray-300 text-black"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-black">{p.name}</td>
                      <td className="p-4 text-black/80">{p.department || "—"}</td>
                      <td className="p-4 text-black/80">{p.subDepartment || "—"}</td>
                      <td className="p-4 text-black/80">
                        {Object.entries(parseSizes(p.sizes)).length
                          ? Object.entries(parseSizes(p.sizes)).map(([k, v]) => `${k}: ${v}`).join(", ")
                          : "—"}
                      </td>
                      <td className="p-4 flex gap-2">
                        <button
                          onClick={() => {
                            setForm({
                              name: p.name,
                              department: p.department || "",
                              subDepartment: p.subDepartment || "",
                            });
                            setSizeEntries(parseSizes(p.sizes));
                            setNewSizeItem("");
                            setNewSizeValue("");
                            setEditingId(p.id);
                          }}
                          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Remove
                        </button>
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
