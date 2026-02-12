"use client";

import { useRouter } from "next/navigation";

export default function PPEManagementPage() {
  const router = useRouter();

  const items = [
    {
      title: "PPE Size List",
      description: "Manage people and their PPE sizes. Add, edit and remove people.",
      route: "/ppe-management/size-list",
    },
    {
      title: "PPE Issue Register",
      description: "Issue PPE to people and record signatures. Send for electronic signature via email or phone.",
      route: "/ppe-management/issue-register",
    },
    {
      title: "Stock List",
      description: "Manage stock levels for each PPE item. Stock deducts when someone signs for an issue.",
      route: "/ppe-management/stock-list",
    },
  ];

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-black">PPE Management</h1>
        <p className="text-black/70">
          Manage sizes, issue register and stock. People from the size list appear in the issue register.
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
