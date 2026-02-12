"use client";

import { useRouter } from "next/navigation";

export default function MedicalsPage() {
  const router = useRouter();

  const items = [
    {
      title: "Add Medical",
      description: "Record a new medical examination for an employee.",
      route: "/medicals/add",
    },
    {
      title: "View All Medicals",
      description: "Browse, filter and manage all medical records.",
      route: "/medicals/list",
    },
    {
      title: "Medical Analysis",
      description: "View compliance by medical type — who is due and who needs renewal.",
      route: "/medicals/analysis",
    },
  ];

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-black">Medicals</h1>
        <p className="text-black/70">
          Manage medical examinations, expiries and compliance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.route)}
              className="text-left p-6 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 hover:bg-white/80 transition"
            >
              <h2 className="text-xl font-bold text-black mb-2">{item.title}</h2>
              <p className="text-black/70 text-sm">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
