"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userLimit, setUserLimit] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          email,
          password,
          userLimit: typeof userLimit === "number" && userLimit > 0 ? userLimit : undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Failed to register company.");
        setLoading(false);
        return;
      }

      setSuccess("Company registered successfully. You can now log in as the admin.");
      setLoading(false);

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      console.error("Signup error", err);
      setError("Unexpected error during registration. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        className="rounded-2xl p-8 backdrop-blur-xl shadow-xl w-full max-w-lg space-y-6"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Register your company
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            This will create a new company account and an admin user for that company.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-[var(--foreground)]">
              Company name
            </label>
            <input
              type="text"
              className="w-full p-3 rounded-xl bg-white/70 border"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[var(--foreground)]">
              Admin email
            </label>
            <input
              type="email"
              className="w-full p-3 rounded-xl bg-white/70 border"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[var(--foreground)]">
              Admin password
            </label>
            <input
              type="password"
              className="w-full p-3 rounded-xl bg-white/70 border"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-[var(--foreground)]">
              Maximum users for this company (optional)
            </label>
            <input
              type="number"
              min={1}
              className="w-full p-3 rounded-xl bg-white/70 border"
              value={userLimit === "" ? "" : userLimit}
              onChange={(e) => {
                const v = e.target.value;
                setUserLimit(v === "" ? "" : Number(v));
              }}
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              If left blank, the default limit from the plan (currently 5) will be used.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[var(--gold)] text-black font-semibold hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register company"}
          </button>
        </form>

        <div className="text-sm text-[var(--muted-foreground)] text-center">
          <p>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="underline hover:text-[var(--foreground)]"
            >
              Back to login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

