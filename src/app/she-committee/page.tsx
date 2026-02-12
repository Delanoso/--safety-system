"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Vote, Calendar } from "lucide-react";

export default function SHECommitteePage() {
  const router = useRouter();

  const items = [
    {
      title: "SHE Rep Election",
      description: "Create elections, add candidates, invite voters, and view results.",
      route: "/she-committee/elections",
      icon: <Vote size={24} />,
    },
    {
      title: "Meetings",
      description: "View and add meeting minutes, agendas and action items.",
      route: "/she-committee/meetings",
      icon: <Calendar size={24} />,
    },
  ];

  return (
    <div className="min-h-screen p-10 bg-gradient-to-r from-blue-200 to-purple-300">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="button button-neutral flex items-center gap-2"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-black">SHE Committee</h1>
        <p className="text-black/70">
          Safety, Health and Environment committee — members and meetings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.route)}
              className="text-left p-6 rounded-2xl shadow-xl bg-white/60 backdrop-blur-xl border border-white/40 hover:bg-white/80 transition flex flex-col gap-3"
            >
              <span className="text-[var(--gold)]">{item.icon}</span>
              <h2 className="text-xl font-bold text-black">{item.title}</h2>
              <p className="text-black/70 text-sm">{item.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
