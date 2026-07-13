"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import HazardousChemicalForm, {
  type HazardousChemicalFormValues,
} from "@/components/hazardous-chemicals/HazardousChemicalForm";

type Chemical = {
  id: string;
  name: string;
  casNumber: string | null;
  location: string | null;
  quantity: string | null;
  unit: string | null;
  sdsUrl: string | null;
  hazardClass: string | null;
  notes: string | null;
};

export default function EditHazardousChemicalPage() {
  const params = useParams() as { id: string };
  const id = params.id;
  const [chemical, setChemical] = useState<Chemical | null>(null);

  useEffect(() => {
    fetch(`/api/hazardous-chemicals/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setChemical(data);
      })
      .catch(() => setChemical(null));
  }, [id]);

  async function handleSubmit(values: HazardousChemicalFormValues) {
    const res = await fetch(`/api/hazardous-chemicals/${id}`, {
      method: "PATCH",
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
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to save");
    window.location.href = "/hazardous-chemicals";
  }

  if (!chemical) {
    return (
      <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
        <div className="max-w-3xl mx-auto">
          <p className="text-black/70">Chemical not found.</p>
          <Link href="/hazardous-chemicals" className="text-blue-600 hover:underline mt-4 block">
            ← Back to register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-3xl mx-auto space-y-10">
        <Link href="/hazardous-chemicals" className="text-black/70 hover:text-black">
          ← Hazardous Chemicals
        </Link>

        <div>
          <h1 className="text-4xl font-bold text-black">Edit Chemical</h1>
          <p className="text-black/70">
            Update details or upload the MSDS / SDS for {chemical.name}.
          </p>
        </div>

        <HazardousChemicalForm
          initial={{
            name: chemical.name,
            casNumber: chemical.casNumber ?? "",
            location: chemical.location ?? "",
            quantity: chemical.quantity ?? "",
            unit: chemical.unit ?? "",
            sdsUrl: chemical.sdsUrl ?? "",
            hazardClass: chemical.hazardClass ?? "",
            notes: chemical.notes ?? "",
          }}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
