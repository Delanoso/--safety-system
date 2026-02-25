"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Company = { id: string; name: string };

function CreateAppointmentFormContent() {
  const params = useSearchParams();
  const router = useRouter();

  const type = params.get("type") || "Unknown Appointment";

  const [appointee, setAppointee] = useState("");
  const [appointer, setAppointer] = useState("");
  const [date, setDate] = useState("");
  const [department, setDepartment] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isSuper, setIsSuper] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { user: { companyId: string | null; companyName: string | null; role: string } | null }) => {
        const u = data?.user;
        if (u?.companyId) setCompanyId(u.companyId);
        if (u?.companyName) setCompanyName(u.companyName);
        if (u?.role === "super") setIsSuper(true);
        setUserLoaded(true);
      })
      .catch(() => setUserLoaded(true));
  }, []);

  useEffect(() => {
    if (!isSuper) return;
    fetch("/api/companies", { credentials: "include" })
      .then((r) => r.json())
      .then((list: Company[]) => {
        if (Array.isArray(list)) setCompanies(list);
      })
      .catch(() => {});
  }, [isSuper]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        type,
        appointee,
        appointer,
        department,
        date,
        status: "draft",
      };
      if (isSuper && companyId) body.companyId = companyId;

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = typeof data?.error === "string" ? data.error : "Failed to create appointment";
        setError(message);
        setLoading(false);
        return;
      }

      const id = data?.id;

      if (!id) {
        setError("API did not return an ID");
        setLoading(false);
        return;
      }

      router.push(`/appointments/request-signature/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 p-6">
      <h1 className="text-4xl font-bold text-[var(--foreground)]">
        Create: {type}
      </h1>

      <p className="text-[var(--foreground)] opacity-80 max-w-2xl">
        Please complete the details below for the <strong>{type}</strong>{" "}
        appointment.
      </p>

      {error && (
        <div
          className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-700 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        <div>
          <label className="block mb-1 text-[var(--foreground)] font-medium">
            Company
          </label>
          {!userLoaded ? (
            <p className="text-[var(--foreground)] opacity-70">Loading...</p>
          ) : isSuper ? (
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              required
              className="
                w-full p-3 rounded-xl
                bg-[rgba(255,255,255,0.55)]
                backdrop-blur-md
                border border-[rgba(0,0,0,0.15)]
                text-[var(--foreground)]
              "
            >
              <option value="">Select company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input
                type="text"
                value={companyName ?? "—"}
                readOnly
                className="
                  w-full p-3 rounded-xl
                  bg-[rgba(255,255,255,0.35)]
                  backdrop-blur-md
                  border border-[rgba(0,0,0,0.15)]
                  text-[var(--foreground)] opacity-90
                "
                aria-label="Company (your account)"
              />
              {!companyName && (
                <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                  No company linked to your account. Contact an administrator.
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <label className="block mb-1 text-[var(--foreground)] font-medium">
            Appointee
          </label>
          <input
            type="text"
            value={appointee}
            onChange={(e) => setAppointee(e.target.value)}
            placeholder="Enter the name of the person being appointed"
            required
            className="
              w-full p-3 rounded-xl
              bg-[rgba(255,255,255,0.55)]
              backdrop-blur-md
              border border-[rgba(0,0,0,0.15)]
              text-[var(--foreground)]
            "
          />
        </div>

        <div>
          <label className="block mb-1 text-[var(--foreground)] font-medium">
            Appointer
          </label>
          <input
            type="text"
            value={appointer}
            onChange={(e) => setAppointer(e.target.value)}
            placeholder="Enter the name of the person making the appointment"
            required
            className="
              w-full p-3 rounded-xl
              bg-[rgba(255,255,255,0.55)]
              backdrop-blur-md
              border border-[rgba(0,0,0,0.15)]
              text-[var(--foreground)]
            "
          />
        </div>

        <div>
          <label className="block mb-1 text-[var(--foreground)] font-medium">
            Date of Appointment
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="
              w-full p-3 rounded-xl
              bg-[rgba(255,255,255,0.55)]
              backdrop-blur-md
              border border-[rgba(0,0,0,0.15)]
              text-[var(--foreground)]
            "
          />
        </div>

        <div>
          <label className="block mb-1 text-[var(--foreground)] font-medium">
            Department
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Enter the department of the appointee"
            required
            className="
              w-full p-3 rounded-xl
              bg-[rgba(255,255,255,0.55)]
              backdrop-blur-md
              border border-[rgba(0,0,0,0.15)]
              text-[var(--foreground)]
            "
          />
        </div>

        <button
          type="submit"
          disabled={loading || !userLoaded || (!isSuper && !companyName) || (isSuper && !companyId)}
          className="
            px-6 py-3 rounded-xl font-semibold
            bg-[var(--gold)] text-black
            hover:brightness-110 transition
            disabled:opacity-50
          "
        >
          {loading ? "Saving..." : "Save Appointment"}
        </button>
      </form>
    </div>
  );
}

export default function CreateAppointmentForm() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <CreateAppointmentFormContent />
    </Suspense>
  );
}