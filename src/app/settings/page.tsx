"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";

type CurrentUser = {
  id: string;
  email: string;
  role: "user" | "admin" | "super";
  companyId: string | null;
  companyName: string | null;
};

type CompanySettings = {
  id: string;
  name: string;
  logoUrl: string | null;
  brandColor: string | null;
};

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [brandColor, setBrandColor] = useState("#1e40af");

  const isAdmin =
    currentUser?.role === "admin" || currentUser?.role === "super";

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
        const meJson = await meRes.json();
        const user = meJson?.user as CurrentUser | null;
        setCurrentUser(user ?? null);

        if (!user || (user.role !== "admin" && user.role !== "super")) {
          setLoading(false);
          return;
        }

        const settingsRes = await fetch("/api/company/settings", {
          credentials: "include",
          cache: "no-store",
        });
        if (!settingsRes.ok) {
          const errJson = await settingsRes.json().catch(() => null);
          setError(errJson?.error || "Could not load company settings.");
          setLoading(false);
          return;
        }

        const settings = (await settingsRes.json()) as CompanySettings;
        setCompany(settings);
        setName(settings.name);
        setBrandColor(settings.brandColor || "#1e40af");
      } catch {
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/company/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          brandColor: brandColor.trim() || null,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error || "Failed to save settings.");
        setSaving(false);
        return;
      }

      setCompany(json as CompanySettings);
      setMessage("Company settings saved.");
    } catch {
      setError("Unexpected error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    setError(null);
    setMessage(null);

    try {
      const data = new FormData();
      data.append("file", file);

      const uploadRes = await fetch("/api/company/logo", {
        method: "POST",
        credentials: "include",
        body: data,
      });

      const uploadJson = await uploadRes.json().catch(() => null);
      if (!uploadRes.ok || !uploadJson?.logoUrl) {
        setError(uploadJson?.error || "Failed to upload company logo.");
        setLogoUploading(false);
        return;
      }

      setCompany((prev) =>
        prev ? { ...prev, logoUrl: uploadJson.logoUrl as string } : prev
      );
      setMessage("Company logo updated.");
    } catch {
      setError("Unexpected error while uploading logo.");
    } finally {
      setLogoUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-[var(--muted-foreground)] animate-pulse">
        Loading settings…
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-6 text-red-600">
        You must be logged in to view settings.
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-lg">
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Settings</h1>
        <p className="text-[var(--muted-foreground)]">
          Only company administrators can change company settings. Contact your admin if you need changes.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="text-[var(--gold)]" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Company branding used on PDF documents and across Salus.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {message && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}

      <div
        className="rounded-2xl p-6 shadow-xl space-y-5"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Company logo
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Shown in the top-left of every downloaded PDF.
        </p>

        {company?.logoUrl && (
          <div className="flex items-center gap-4">
            <img
              src={company.logoUrl}
              alt="Company logo"
              className="h-14 w-auto border border-[var(--card-border)] bg-white rounded p-1"
            />
            <span className="text-xs text-[var(--muted-foreground)]">Current logo</span>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleLogoFile}
          disabled={logoUploading}
          className="block w-full text-sm text-[var(--foreground)]"
        />
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl p-6 shadow-xl space-y-5"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Company details
        </h2>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Company name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--card-border)] bg-white/50 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Brand colour
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-[var(--card-border)]"
            />
            <input
              type="text"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              placeholder="#1e40af"
              className="flex-1 rounded-lg border border-[var(--card-border)] bg-white/50 px-3 py-2 text-sm font-mono"
            />
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Saved for future UI theming. PDF headers currently use the standard Salus blue.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="button button-primary"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </form>
    </div>
  );
}
