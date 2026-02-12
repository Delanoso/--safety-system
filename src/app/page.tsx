"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Login error", err);
      setError("Unexpected error during login. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        className="rounded-2xl p-8 backdrop-blur-xl shadow-xl w-full max-w-md space-y-6"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Login</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Sign in to your company account to access the Safety System.
          </p>
        </div>

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

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--gold)] text-black font-semibold hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="text-sm text-[var(--muted-foreground)] text-center">
          <p>
            New company?{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="underline hover:text-[var(--foreground)]"
            >
              Register your company
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
