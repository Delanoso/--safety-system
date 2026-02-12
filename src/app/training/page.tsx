"use client";

import { useRouter } from "next/navigation";

export default function TrainingPage() {
  const router = useRouter();

  const items = [
    {
      title: "Certificates",
      description: "Manage employee certificates, expiries, uploads and renewals.",
      route: "/training/certificates",
    },
    {
      title: "Training Analysis",
      description: "View training gaps, compliance status and required training.",
      route: "/training/analysis",
    },
  ];

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-black">Training Module</h1>
        <p className="text-black/70">
          Select a training function below.
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

