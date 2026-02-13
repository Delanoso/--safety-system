"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Mail, Lock, Bell, BellOff } from "lucide-react";

type ProfileData = {
  email: string;
  notificationsEnabled: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [notificationsSaving, setNotificationsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d);
        setEmail(d?.email ?? "");
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    setEmailSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data?.error ?? "Failed to update email");
        return;
      }
      setEmailSuccess(true);
      setProfile((p) => (p ? { ...p, email: email.trim() } : p));
    } catch {
      setEmailError("Failed to update email");
    } finally {
      setEmailSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data?.error ?? "Failed to update password");
        return;
      }
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function handleNotificationsToggle() {
    if (!profile) return;
    const next = !profile.notificationsEnabled;
    setNotificationsSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationsEnabled: next }),
      });
      if (res.ok) setProfile((p) => (p ? { ...p, notificationsEnabled: next } : p));
    } finally {
      setNotificationsSaving(false);
    }
  }

  if (loading) return <p className="text-[var(--muted-foreground)]">Loading…</p>;
  if (!profile) return <p className="text-red-600">Unable to load profile.</p>;

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-[var(--foreground)]/10 transition"
          title="Back to Dashboard"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          My Profile
        </h1>
      </div>

      {/* Sign out */}
      <section className="p-6 rounded-2xl border border-[var(--foreground)]/10 bg-[var(--card-bg)]">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <LogOut size={20} />
          Sign out
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Sign out of your account on this device.
        </p>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
        >
          Sign out
        </button>
      </section>

      {/* Email */}
      <section className="p-6 rounded-2xl border border-[var(--foreground)]/10 bg-[var(--card-bg)]">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail size={20} />
          Email address
        </h2>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border bg-[var(--background)]"
            placeholder="your@email.com"
            required
          />
          {emailError && <p className="text-sm text-red-600">{emailError}</p>}
          {emailSuccess && (
            <p className="text-sm text-green-600">Email updated successfully.</p>
          )}
          <button
            type="submit"
            disabled={emailSaving || email === profile.email}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {emailSaving ? "Saving…" : "Update email"}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="p-6 rounded-2xl border border-[var(--foreground)]/10 bg-[var(--card-bg)]">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock size={20} />
          Change password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 rounded-lg border bg-[var(--background)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded-lg border bg-[var(--background)]"
              minLength={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-lg border bg-[var(--background)]"
              minLength={6}
              required
            />
          </div>
          {passwordError && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-green-600">Password updated successfully.</p>
          )}
          <button
            type="submit"
            disabled={passwordSaving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {passwordSaving ? "Saving…" : "Update password"}
          </button>
        </form>
      </section>

      {/* Notifications */}
      <section className="p-6 rounded-2xl border border-[var(--foreground)]/10 bg-[var(--card-bg)]">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {profile.notificationsEnabled ? (
            <Bell size={20} />
          ) : (
            <BellOff size={20} />
          )}
          Notifications
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          When enabled, you will see in-app notifications (e.g. expiring
          certificates, medicals, documents awaiting signature) in the bell icon
          and notifications page.
        </p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={profile.notificationsEnabled}
            onChange={handleNotificationsToggle}
            disabled={notificationsSaving}
            className="w-4 h-4 rounded"
          />
          <span className="font-medium">
            {profile.notificationsEnabled ? "Notifications on" : "Notifications off"}
          </span>
        </label>
      </section>
    </div>
  );
}
