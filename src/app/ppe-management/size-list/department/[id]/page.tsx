"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type PPEItemType = { id: number; name: string };
type SubDepartment = { id: number; name: string; _count?: { persons: number } };
type Department = { id: number; name: string; subDepartments: SubDepartment[] };

export default function DepartmentSubListPage() {
  const params = useParams();
  const id = params.id as string;
  const [department, setDepartment] = useState<Department | null>(null);
  const [itemTypes, setItemTypes] = useState<PPEItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubName, setNewSubName] = useState("");
  const [selectedItemTypeIds, setSelectedItemTypeIds] = useState<number[]>([]);

  function load() {
    fetch(`/api/ppe/departments/${id}`)
      .then((r) => r.json())
      .then(setDepartment)
      .catch(() => setDepartment(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  useEffect(() => {
    fetch("/api/ppe/item-types")
      .then((r) => r.json())
      .then(setItemTypes)
      .catch(() => setItemTypes([]));
  }, []);

  function toggleItemType(itemId: number) {
    setSelectedItemTypeIds((prev) =>
      prev.includes(itemId) ? prev.filter((x) => x !== itemId) : [...prev, itemId]
    );
  }

  function handleAddSub(e: React.FormEvent) {
    e.preventDefault();
    const name = newSubName.trim();
    if (!name) return;
    fetch(`/api/ppe/departments/${id}/sub-departments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ppeItemTypeIds: selectedItemTypeIds }),
    })
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d))))
      .then(() => {
        setNewSubName("");
        setSelectedItemTypeIds([]);
        load();
      })
      .catch((err) => alert(err?.error || "Failed to add sub-department."));
  }

  function handleDeleteSub(subId: number, name: string) {
    if (!confirm(`Delete sub-department "${name}" and all its people?`)) return;
    fetch(`/api/ppe/sub-departments/${subId}`, { method: "DELETE" })
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d))))
      .then(() => load())
      .catch((err) => alert(err?.error || "Failed to delete sub-department."));
  }

  if (loading || !department) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300 flex items-center justify-center">
        <p className="text-black/70">{loading ? "Loading..." : "Department not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link href="/ppe-management/size-list" className="text-black/70 hover:underline text-sm block mb-1">
              ← PPE Size List
            </Link>
            <h1 className="text-4xl font-bold text-black">{department.name}</h1>
            <p className="text-black/70 mt-1">Sub-departments. Open one to add or remove people and set PPE sizes.</p>
          </div>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
          <h2 className="text-lg font-bold text-black mb-4">Add sub-department</h2>
          <form onSubmit={handleAddSub} className="space-y-4">
            <div className="flex gap-2 flex-wrap items-center">
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="Sub-department name"
                className="flex-1 min-w-[200px] p-3 rounded-lg border border-white/40 bg-white/70 text-black"
              />
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
                Add sub-department
              </button>
            </div>
            {itemTypes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-black/80 mb-2">PPE items for this sub-department (for size reminders)</p>
                <div className="flex flex-wrap gap-2">
                  {itemTypes.map((it) => (
                    <label key={it.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 border border-white/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItemTypeIds.includes(it.id)}
                        onChange={() => toggleItemType(it.id)}
                        className="rounded"
                      />
                      <span className="text-sm text-black">{it.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
          <h2 className="p-4 bg-white/40 font-bold text-black border-b border-white/40">Sub-departments</h2>
          {department.subDepartments.length === 0 ? (
            <p className="p-4 text-black/60">No sub-departments yet. Add one above, then open it to add people.</p>
          ) : (
            <ul className="divide-y divide-white/40">
              {department.subDepartments.map((sub) => (
                <li key={sub.id} className="p-4 flex items-center justify-between flex-wrap gap-2">
                  <span className="font-medium text-black">{sub.name}</span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/ppe-management/size-list/department/${id}/sub/${sub.id}`}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                      View people →
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteSub(sub.id, sub.name)}
                      className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
