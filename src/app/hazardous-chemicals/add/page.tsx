"use client";

import Link from "next/link";
import HazardousChemicalForm, {
  type HazardousChemicalFormValues,
} from "@/components/hazardous-chemicals/HazardousChemicalForm";

export default function AddHazardousChemicalPage() {
  async function handleSubmit(values: HazardousChemicalFormValues) {
    const res = await fetch("/api/hazardous-chemicals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        casNumber: values.casNumber || null,
        location: values.location || null,
        quantity: values.quantity || null,
        unit: values.unit || null,
        sdsUrl: values.sdsUrl || null,
        hazardClass: values.hazardClass || null,
        notes: values.notes || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || "Failed to save");
    }

    window.location.href = "/hazardous-chemicals";
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-3xl mx-auto space-y-10">
        <Link href="/hazardous-chemicals" className="text-black/70 hover:text-black">
          ← Hazardous Chemicals
        </Link>

        <h1 className="text-4xl font-bold text-black">Add Hazardous Chemical</h1>
        <p className="text-black/70">Add a chemical to the hazardous substances register.</p>

        <HazardousChemicalForm submitLabel="Add to Register" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
