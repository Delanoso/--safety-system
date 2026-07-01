"use client";

import { useState } from "react";
import Link from "next/link";
import PersonAutocomplete, { type CompanyPersonRecord } from "@/components/PersonAutocomplete";

export default function AddVisitorPage() {
  const [form, setForm] = useState({
    visitorName: "",
    visitorCompany: "",
    idNumber: "",
    contactNumber: "",
    hostName: "",
    hostDepartment: "",
    purpose: "",
    location: "",
    vehicleReg: "",
    notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/visitor-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      alert(json.error ?? "Failed to check in");
      return;
    }
    window.location.href = "/visitor-register/list";
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10 bg-gradient-to-r from-amber-100 to-orange-200">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/visitor-register" className="button button-neutral">Back</Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-black">Check In Visitor</h1>
        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40">
          <div>
            <label className="block text-sm font-semibold mb-1">Visitor name *</label>
            <input name="visitorName" value={form.visitorName} onChange={handleChange} required className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Visitor company</label>
              <input name="visitorCompany" value={form.visitorCompany} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">ID number</label>
              <input name="idNumber" value={form.idNumber} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Contact number</label>
            <input name="contactNumber" value={form.contactNumber} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>
          <PersonAutocomplete
            label="Search host (employee)"
            onSelect={(person: CompanyPersonRecord) => {
              const name = [person.name, person.surname].filter(Boolean).join(" ");
              setForm((prev) => ({ ...prev, hostName: name, hostDepartment: person.department ?? prev.hostDepartment }));
            }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Host name *</label>
              <input name="hostName" value={form.hostName} onChange={handleChange} required className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Host department</label>
              <input name="hostDepartment" value={form.hostDepartment} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Purpose of visit</label>
            <input name="purpose" value={form.purpose} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Location / area</label>
              <input name="location" value={form.location} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Vehicle registration</label>
              <input name="vehicleReg" value={form.vehicleReg} onChange={handleChange} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full p-3 rounded-lg border border-white/40 bg-white/70" />
          </div>
          <button type="submit" className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Check In Visitor</button>
        </form>
      </div>
    </div>
  );
}
