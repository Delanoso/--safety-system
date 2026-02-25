"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Department = {
  id: number;
  name: string;
  subDepartments: { id: number; name: string }[];
};

export default function PPESizeListPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");

  function load() {
    fetch("/api/ppe/departments")
      .then((r) => r.json())
      .then(setDepartments)
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleDeleteDepartment(id: number, name: string) {
    if (!confirm(`Delete department "${name}" and all its sub-departments and people?`)) return;
    fetch(`/api/ppe/departments/${id}`, { method: "DELETE" })
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d))))
      .then(() => load())
      .catch((err) => alert(err?.error || "Failed to delete department."));
  }

  function handleAddDepartment(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    fetch("/api/ppe/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((r) => (r.ok ? r.json() : r.json().then((d) => Promise.reject(d))))
      .then(() => {
        setNewName("");
        load();
      })
      .catch((err) => alert(err?.error || "Failed to add department."));
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-black">PPE Size List</h1>
            <p className="text-black/70 mt-1">
              Create departments, then sub-departments, then add people and their PPE sizes in each sub-department.
            </p>
          </div>
          <Link
            href="/ppe-management"
            className="px-4 py-2 rounded-xl bg-white/60 border border-white/40 text-black font-semibold hover:bg-white/80 transition"
          >
            ← Back to PPE Management
          </Link>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 p-6">
          <h2 className="text-lg font-bold text-black mb-4">Add department</h2>
          <form onSubmit={handleAddDepartment} className="flex gap-2 flex-wrap items-center">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Department name"
              className="flex-1 min-w-[200px] p-3 rounded-lg border border-white/40 bg-white/70 text-black"
            />
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">
              Add department
            </button>
          </form>
        </div>

        <div className="rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 overflow-hidden">
          <h2 className="p-4 bg-white/40 font-bold text-black border-b border-white/40">Departments</h2>
          {departments.length === 0 ? (
            <p className="p-4 text-black/60">No departments yet. Add one above, then add sub-departments and people.</p>
          ) : (
            <ul className="divide-y divide-white/40">
              {departments.map((dept) => (
                <li key={dept.id} className="p-4 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <Link
                      href={`/ppe-management/size-list/department/${dept.id}`}
                      className="font-semibold text-black hover:underline text-lg"
                    >
                      {dept.name}
                    </Link>
                    <p className="text-sm text-black/60 mt-1">
                      {dept.subDepartments.length} sub-department{dept.subDepartments.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/ppe-management/size-list/department/${dept.id}`}
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
                    >
                      View sub-departments →
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(dept.id, dept.name)}
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
