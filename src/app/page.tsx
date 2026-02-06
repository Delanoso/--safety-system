"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Temporary login logic
    if (email && password) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        className="rounded-2xl p-8 backdrop-blur-xl shadow-xl w-full max-w-md"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <h1 className="text-3xl font-bold mb-6 text-[var(--foreground)]">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block mb-1 text-[var(--foreground)]">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-xl bg-white/70 border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[var(--foreground)]">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-xl bg-white/70 border"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[var(--gold)] text-black font-semibold hover:brightness-110 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
