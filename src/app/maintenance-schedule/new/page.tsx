"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  MAINTENANCE_TYPES,
  MAINTENANCE_TEMPLATES,
  type MaintenanceTypeId,
} from "@/lib/maintenance-templates";

function NewScheduleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = (searchParams.get("type") || "other") as MaintenanceTypeId;
  const validType = ["trucks", "machinery", "lifting_equipment", "other"].includes(type)
    ? type
    : "other";

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const template = MAINTENANCE_TEMPLATES[validType];
  const typeInfo = MAINTENANCE_TYPES.find((t) => t.id === validType);

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const equipmentId = form.equipmentId?.trim();
    if (!equipmentId) {
      alert("Equipment ID / Registration / Asset number is required.");
      setLoading(false);
      return;
    }

    const data: Record<string, string | number | null> = {};
    template.forEach((f) => {
      const v = form[f.key];
      if (v !== undefined && v !== "") {
        if (f.type === "number") data[f.key] = parseFloat(v) || 0;
        else data[f.key] = v;
      }
    });

    try {
      const res = await fetch("/api/maintenance-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title?.trim() || `${typeInfo?.label ?? validType} Schedule`,
          type: validType,
          equipmentId,
          data,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err?.details || err?.error || "Failed to create");
        setLoading(false);
        return;
      }
      const created = await res.json();
      router.push(`/maintenance-schedule/${created.id}`);
    } catch {
      alert("Failed to create schedule");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-slate-100 to-indigo-100">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/maintenance-schedule"
          className="text-black/70 hover:text-black flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-black">New {typeInfo?.label ?? validType} Schedule</h1>
          <p className="text-black/70 mt-1">Add the first item to your maintenance list.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl bg-white/70 backdrop-blur border border-white/40 shadow-xl"
        >
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Schedule title</label>
            <input
              type="text"
              value={form.title ?? ""}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder={`e.g. Fleet Trucks, Factory Machinery`}
              className="w-full p-3 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          {template.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-semibold text-black mb-1">
                {field.label}
                {field.required && " *"}
              </label>
              {field.type === "date" ? (
                <input
                  type="date"
                  value={form[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                  required={field.required}
                />
              ) : field.type === "number" ? (
                <input
                  type="number"
                  value={form[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                  required={field.required}
                />
              ) : (
                <input
                  type="text"
                  value={form[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-3 rounded-lg border border-slate-200 bg-white"
                  required={field.required}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="button button-save w-full py-3 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create schedule"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewSchedulePage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-10 flex items-center justify-center">Loading...</div>}>
      <NewScheduleContent />
    </Suspense>
  );
}
