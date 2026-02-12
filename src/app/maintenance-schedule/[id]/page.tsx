"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Wrench,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  MAINTENANCE_TYPES,
  MAINTENANCE_TEMPLATES,
  type MaintenanceTypeId,
} from "@/lib/maintenance-templates";

type Service = {
  id: string;
  serviceDate: string;
  description: string | null;
  meterReading: number | null;
  nextDueDate: string | null;
  performedBy: string | null;
  notes: string | null;
};

type Item = {
  id: string;
  equipmentId: string;
  data: string;
  services: Service[];
};

type Schedule = {
  id: string;
  title: string;
  type: string;
  items: Item[];
};

export default function ScheduleDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [addingService, setAddingService] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/maintenance-schedules/${id}`);
      if (!res.ok) {
        setSchedule(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSchedule(data);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleAddItem(data: { equipmentId: string; data: Record<string, unknown> }) {
    const res = await fetch(`/api/maintenance-schedules/${id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const item = await res.json();
    setSchedule((prev) =>
      prev ? { ...prev, items: [...prev.items, item] } : null
    );
    setAddingItem(false);
  }

  async function handleUpdateItem(
    itemId: string,
    data: { equipmentId?: string; data?: Record<string, unknown> }
  ) {
    const res = await fetch(`/api/maintenance-schedules/${id}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setSchedule((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) => (i.id === itemId ? updated : i)),
          }
        : null
    );
    setEditingItem(null);
  }

  async function handleDeleteItem(itemId: string) {
    if (!confirm("Remove this item from the schedule?")) return;
    const res = await fetch(`/api/maintenance-schedules/${id}/items/${itemId}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    setSchedule((prev) =>
      prev ? { ...prev, items: prev.items.filter((i) => i.id !== itemId) } : null
    );
  }

  async function handleAddService(
    itemId: string,
    data: {
      serviceDate: string;
      description?: string;
      meterReading?: number;
      nextDueDate?: string;
      performedBy?: string;
      notes?: string;
    }
  ) {
    const res = await fetch(
      `/api/maintenance-schedules/${id}/items/${itemId}/services`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) return;
    const service = await res.json();
    setSchedule((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((i) =>
              i.id === itemId
                ? { ...i, services: [service, ...i.services] }
                : i
            ),
          }
        : null
    );
    setAddingService(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-br from-slate-100 to-indigo-100 flex items-center justify-center">
        <p className="text-black/60">Loading...</p>
      </div>
    );
  }
  if (!schedule) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-br from-slate-100 to-indigo-100">
        <div className="max-w-4xl mx-auto">
          <Link href="/maintenance-schedule" className="text-black/70 hover:text-black">
            ← Maintenance Schedule
          </Link>
          <p className="mt-4 text-red-600">Schedule not found.</p>
        </div>
      </div>
    );
  }

  const template = MAINTENANCE_TEMPLATES[schedule.type as MaintenanceTypeId] ?? MAINTENANCE_TEMPLATES.other;

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-slate-100 to-indigo-100">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/maintenance-schedule"
            className="text-black/70 hover:text-black flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Maintenance Schedule
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black">{schedule.title}</h1>
            <p className="text-black/60">{schedule.items.length} item(s)</p>
          </div>
          <Link
            href="/maintenance-schedule"
            className="button button-neutral flex items-center gap-2 w-fit"
          >
            All schedules
          </Link>
        </div>

        <div className="space-y-4">
          {schedule.items.map((item) => {
            const data = (() => {
              try {
                return (typeof item.data === "string" ? JSON.parse(item.data) : item.data) || {};
              } catch {
                return {};
              }
            })();
            const isExpanded = expandedItem === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white/70 border border-white/40 overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/50"
                  onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100">
                      <Wrench size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <span className="font-semibold text-black">{item.equipmentId}</span>
                      {data.makeModel && (
                        <span className="ml-2 text-black/60">– {data.makeModel}</span>
                      )}
                      {data.description && !data.makeModel && (
                        <span className="ml-2 text-black/60">– {data.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.services.length > 0 && (
                      <span className="text-sm text-black/50">
                        {item.services.length} service{item.services.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(editingItem === item.id ? null : item.id);
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-black/50" />
                    ) : (
                      <ChevronDown size={20} className="text-black/50" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-black/5 p-6 space-y-6">
                    {editingItem === item.id ? (
                      <EditItemForm
                        item={item}
                        template={template}
                        onSave={(d) => handleUpdateItem(item.id, d)}
                        onCancel={() => setEditingItem(null)}
                      />
                    ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {template
                        .filter((f) => f.key !== "equipmentId" && data[f.key] != null)
                        .map((f) => (
                          <div key={f.key}>
                            <p className="text-xs text-black/50">{f.label}</p>
                            <p className="font-medium">
                              {f.type === "date" && data[f.key]
                                ? new Date(data[f.key] as string).toLocaleDateString()
                                : String(data[f.key] ?? "")}
                            </p>
                          </div>
                        ))}
                    </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-black">Service history</h3>
                        <button
                          onClick={() =>
                            setAddingService(addingService === item.id ? null : item.id)
                          }
                          className="button button-save text-sm py-1.5 px-3"
                        >
                          {addingService === item.id ? "Cancel" : "Add service"}
                        </button>
                      </div>

                      {addingService === item.id && (
                        <AddServiceForm
                          onSave={(d) => {
                            handleAddService(item.id, d);
                            setAddingService(null);
                          }}
                          onCancel={() => setAddingService(null)}
                        />
                      )}

                      {item.services.length === 0 && addingService !== item.id ? (
                        <p className="text-black/50 text-sm">No services recorded yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {item.services.map((s) => (
                            <li
                              key={s.id}
                              className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
                            >
                              <Calendar size={16} className="text-black/40 mt-0.5" />
                              <div>
                                <p className="font-medium text-black">
                                  {new Date(s.serviceDate).toLocaleDateString()}
                                  {s.performedBy && ` · ${s.performedBy}`}
                                </p>
                                {s.description && (
                                  <p className="text-sm text-black/70">{s.description}</p>
                                )}
                                {s.meterReading != null && (
                                  <p className="text-xs text-black/50">
                                    Meter: {s.meterReading}
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {addingItem ? (
          <AddItemForm
            template={template}
            scheduleType={schedule.type}
            onSave={(d) => {
              handleAddItem(d);
              setAddingItem(false);
            }}
            onCancel={() => setAddingItem(false)}
          />
        ) : (
          <button
            onClick={() => setAddingItem(true)}
            className="w-full py-4 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50/50 flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add item to this schedule
          </button>
        )}
      </div>
    </div>
  );
}

function EditItemForm({
  item,
  template,
  onSave,
  onCancel,
}: {
  item: Item;
  template: (typeof MAINTENANCE_TEMPLATES)[MaintenanceTypeId];
  onSave: (data: { equipmentId?: string; data?: Record<string, unknown> }) => void;
  onCancel: () => void;
}) {
  const initialData = (() => {
    try {
      return (typeof item.data === "string" ? JSON.parse(item.data) : item.data) || {};
    } catch {
      return {};
    }
  })();
  const [form, setForm] = useState<Record<string, string>>({
    equipmentId: item.equipmentId,
    ...Object.fromEntries(
      template
        .filter((f) => f.key !== "equipmentId")
        .map((f) => [f.key, initialData[f.key] != null ? String(initialData[f.key]) : ""])
    ),
  });

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const equipmentId = form.equipmentId?.trim();
    if (!equipmentId) {
      alert("Equipment ID is required.");
      return;
    }
    const data: Record<string, unknown> = {};
    template
      .filter((f) => f.key !== "equipmentId")
      .forEach((f) => {
        const v = form[f.key];
        if (v !== undefined && v !== "") {
          data[f.key] = f.type === "number" ? parseFloat(v) || 0 : v;
        }
      });
    onSave({ equipmentId, data });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-lg bg-slate-50 border">
      <h4 className="font-medium text-black">Edit item</h4>
      {template.map((field) => (
        <div key={field.key}>
          <label className="block text-xs font-medium text-black mb-1">
            {field.label}
            {field.required && " *"}
          </label>
          {field.type === "date" ? (
            <input
              type="date"
              value={form[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full p-2 rounded border text-sm"
              required={field.required}
            />
          ) : field.type === "number" ? (
            <input
              type="number"
              value={form[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full p-2 rounded border text-sm"
              required={field.required}
            />
          ) : (
            <input
              type="text"
              value={form[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full p-2 rounded border text-sm"
              required={field.required}
            />
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <button type="submit" className="button button-save text-sm">
          Save changes
        </button>
        <button type="button" onClick={onCancel} className="button button-neutral text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddItemForm({
  template,
  scheduleType,
  onSave,
  onCancel,
}: {
  template: (typeof MAINTENANCE_TEMPLATES)[MaintenanceTypeId];
  scheduleType: string;
  onSave: (data: { equipmentId: string; data: Record<string, unknown> }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Record<string, string>>({});

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const equipmentId = form.equipmentId?.trim();
    if (!equipmentId) {
      alert("Equipment ID is required.");
      return;
    }
    const data: Record<string, unknown> = {};
    template.forEach((f) => {
      const v = form[f.key];
      if (v !== undefined && v !== "") {
        data[f.key] = f.type === "number" ? parseFloat(v) || 0 : v;
      }
    });
    onSave({ equipmentId, data });
  }

  return (
    <div className="rounded-2xl bg-white/70 border border-white/40 p-6 space-y-4">
      <h3 className="font-semibold text-black">Add item</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {template.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-black mb-1">
              {field.label}
              {field.required && " *"}
            </label>
            {field.type === "date" ? (
              <input
                type="date"
                value={form[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                required={field.required}
              />
            ) : field.type === "number" ? (
              <input
                type="number"
                value={form[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                required={field.required}
              />
            ) : (
              <input
                type="text"
                value={form[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                required={field.required}
              />
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button type="submit" className="button button-save">
            Add
          </button>
          <button type="button" onClick={onCancel} className="button button-neutral">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function AddServiceForm({
  onSave,
  onCancel,
}: {
  onSave: (data: {
    serviceDate: string;
    description?: string;
    meterReading?: number;
    nextDueDate?: string;
    performedBy?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    serviceDate: new Date().toISOString().slice(0, 10),
    description: "",
    meterReading: "",
    nextDueDate: "",
    performedBy: "",
    notes: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      serviceDate: form.serviceDate,
      description: form.description.trim() || undefined,
      meterReading: form.meterReading ? parseFloat(form.meterReading) : undefined,
      nextDueDate: form.nextDueDate || undefined,
      performedBy: form.performedBy.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-lg bg-white border border-slate-200 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-black mb-1">Service date *</label>
          <input
            type="date"
            value={form.serviceDate}
            onChange={(e) => setForm((p) => ({ ...p, serviceDate: e.target.value }))}
            className="w-full p-2 rounded border text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-black mb-1">Meter reading</label>
          <input
            type="number"
            value={form.meterReading}
            onChange={(e) => setForm((p) => ({ ...p, meterReading: e.target.value }))}
            placeholder="Odometer or hours"
            className="w-full p-2 rounded border text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-black mb-1">Description</label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="What was done"
          className="w-full p-2 rounded border text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-black mb-1">Next due date</label>
          <input
            type="date"
            value={form.nextDueDate}
            onChange={(e) => setForm((p) => ({ ...p, nextDueDate: e.target.value }))}
            className="w-full p-2 rounded border text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-black mb-1">Performed by</label>
          <input
            type="text"
            value={form.performedBy}
            onChange={(e) => setForm((p) => ({ ...p, performedBy: e.target.value }))}
            placeholder="Technician name"
            className="w-full p-2 rounded border text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-black mb-1">Notes</label>
        <input
          type="text"
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          className="w-full p-2 rounded border text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="button button-save text-sm">
          Save service
        </button>
        <button type="button" onClick={onCancel} className="button button-neutral text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}
