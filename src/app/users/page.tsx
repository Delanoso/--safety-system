"use client";

import { useEffect, useState } from "react";

type CurrentUser = {
  id: string;
  email: string;
  role: "user" | "admin" | "super";
  companyId: string | null;
  companyName: string | null;
};

type UiUser = {
  id: string;
  email: string;
  role: string;
  companyId: string | null;
  companyName: string | null;
  createdAt: string;
};

type UiCompany = {
  id: string;
  name: string;
  userLimit: number;
  userCount: number;
  logoUrl?: string | null;
};

export default function UsersPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<UiUser[]>([]);
  const [companies, setCompanies] = useState<UiCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New user form
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [targetCompanyId, setTargetCompanyId] = useState<string | "">("");
  const [creatingUser, setCreatingUser] = useState(false);

  // Company user limit form (super only)
  const [limitCompanyId, setLimitCompanyId] = useState<string | "">("");
  const [newLimit, setNewLimit] = useState<number | "">("");
  const [updatingLimit, setUpdatingLimit] = useState(false);

  // Company logo upload
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoMessage, setLogoMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        const meData = await meRes.json();
        const user: CurrentUser | null = meData?.user ?? null;

        setCurrentUser(user);

        if (!user) {
          setError("You must be logged in to view user management.");
          setLoading(false);
          return;
        }

        if (user.role === "user") {
          // Normal users do not manage others
          setLoading(false);
          return;
        }

        // Load companies (for admin or super)
        const companiesRes = await fetch("/api/companies", { cache: "no-store" });
        if (companiesRes.ok) {
          const companiesJson: UiCompany[] = await companiesRes.json();
          setCompanies(companiesJson);

          if (!limitCompanyId && companiesJson.length > 0) {
            setLimitCompanyId(companiesJson[0].id);
          }
        }

        // Load users
        const usersRes = await fetch("/api/users", { cache: "no-store" });
        if (usersRes.ok) {
          const usersJson: UiUser[] = await usersRes.json();
          setUsers(usersJson);
        }
      } catch (err) {
        console.error("Failed to load users/companies", err);
        setError("Failed to load user management data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const refreshUsers = async () => {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      if (res.ok) {
        const usersJson: UiUser[] = await res.json();
        setUsers(usersJson);
      }
    } catch (err) {
      console.error("Failed to refresh users", err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setCreatingUser(true);
    setError(null);
    try {
      const body: any = {
        email: newEmail,
        password: newPassword,
        role: newRole,
      };

      // For super user we allow specifying a company explicitly
      if (currentUser.role === "super" && targetCompanyId) {
        body.companyId = targetCompanyId;
      }

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Failed to create user.");
        setCreatingUser(false);
        return;
      }

      setNewEmail("");
      setNewPassword("");
      setNewRole("user");
      await refreshUsers();
      setCreatingUser(false);
    } catch (err) {
      console.error("Create user error", err);
      setError("Unexpected error while creating user.");
      setCreatingUser(false);
    }
  };

  const handleUpdateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!limitCompanyId || typeof newLimit !== "number" || newLimit <= 0) return;

    setUpdatingLimit(true);
    setError(null);
    try {
      const res = await fetch("/api/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: limitCompanyId, userLimit: newLimit }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || "Failed to update user limit.");
        setUpdatingLimit(false);
        return;
      }

      // Refresh companies to show the new limit
      const companiesRes = await fetch("/api/companies", { cache: "no-store" });
      if (companiesRes.ok) {
        const companiesJson: UiCompany[] = await companiesRes.json();
        setCompanies(companiesJson);
      }

      setNewLimit("");
      setUpdatingLimit(false);
    } catch (err) {
      console.error("Update limit error", err);
      setError("Unexpected error while updating user limit.");
      setUpdatingLimit(false);
    }
  };

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setLogoUploading(true);
    setLogoMessage(null);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string
      );

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        setError("Cloudinary configuration is missing.");
        setLogoUploading(false);
        return;
      }

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok || !uploadJson.secure_url) {
        setError("Failed to upload logo to Cloudinary.");
        setLogoUploading(false);
        return;
      }

      const logoUrl = uploadJson.secure_url as string;

      const patchRes = await fetch("/api/company/logo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl }),
      });

      const patchJson = await patchRes.json().catch(() => null);
      if (!patchRes.ok) {
        setError(patchJson?.error || "Failed to save company logo.");
        setLogoUploading(false);
        return;
      }

      setLogoMessage("Company logo updated successfully.");

      // Refresh companies so the new logo is visible
      const companiesRes = await fetch("/api/companies", { cache: "no-store" });
      if (companiesRes.ok) {
        const companiesJson: UiCompany[] = await companiesRes.json();
        setCompanies(companiesJson);
      }
    } catch (err) {
      console.error("Logo upload error", err);
      setError("Unexpected error while uploading logo.");
    } finally {
      setLogoUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10">
        <p className="text-[var(--foreground)]">Loading user management…</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-10">
        <p className="text-red-600 font-semibold">
          You are not logged in. Please go back to the login page.
        </p>
      </div>
    );
  }

  if (currentUser.role === "user") {
    return (
      <div className="p-10 space-y-4">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Your profile
        </h1>
        <p className="text-[var(--muted-foreground)] max-w-xl">
          You are a standard user in the system. You can use all the modules you
          are permitted to, but user and company administration is handled by your
          company&apos;s admins or the system super user.
        </p>
        <div
          className="rounded-2xl p-6 shadow-xl max-w-md"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <p className="text-sm">
            <span className="font-semibold">Email:</span> {currentUser.email}
          </p>
          <p className="text-sm mt-1">
            <span className="font-semibold">Role:</span> {currentUser.role}
          </p>
          <p className="text-sm mt-1">
            <span className="font-semibold">Company:</span>{" "}
            {currentUser.companyName ?? "Not assigned"}
          </p>
        </div>
      </div>
    );
  }

  const isSuper = currentUser.role === "super";

  const currentCompany =
    !isSuper && currentUser.companyId
      ? companies.find((c) => c.id === currentUser.companyId) ?? null
      : null;

  return (
    <div className="p-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          User management
        </h1>
        <p className="text-[var(--muted-foreground)] max-w-2xl">
          {isSuper
            ? "You are the super user. You can manage all companies and all users in the system."
            : "You are an admin for your company. You can add and manage users for your own company only."}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-w-2xl">
          {error}
        </p>
      )}

      {/* Company overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Company info */}
        <div
          className="rounded-2xl p-6 shadow-xl space-y-4"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {isSuper ? "Companies" : "Your company"}
          </h2>

          {isSuper ? (
            <div className="space-y-3">
              {companies.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No companies found yet. New companies can register from the signup page.
                </p>
              )}
              {companies.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl p-3 flex items-center justify-between text-sm"
                  style={{
                    background: "rgba(255,255,255,0.4)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-[var(--muted-foreground)]">
                      Users: {c.userCount} / {c.userLimit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentCompany ? (
            <div className="space-y-4 text-sm">
              <div>
                <p>
                  <span className="font-semibold">Name:</span> {currentCompany.name}
                </p>
                <p>
                  <span className="font-semibold">Users:</span> {currentCompany.userCount} /{" "}
                  {currentCompany.userLimit}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-[var(--foreground)]">
                  Company logo for PDF header
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Upload your company logo once. It will be used in PDF headers for this company.
                </p>

                {currentCompany.logoUrl && (
                  <div className="flex items-center gap-3">
                    <img
                      src={currentCompany.logoUrl}
                      alt="Company logo"
                      className="h-10 w-auto border border-[var(--card-border)] bg-white rounded"
                    />
                    <span className="text-xs text-[var(--muted-foreground)]">
                      Current logo
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFile}
                  disabled={logoUploading}
                  className="block w-full text-xs text-[var(--foreground)]"
                />

                {logoMessage && (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
                    {logoMessage}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              Your user is not associated with a company record yet.
            </p>
          )}
        </div>

        {/* Right: New user form */}
        <div
          className="rounded-2xl p-6 shadow-xl space-y-4"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Add a new user
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            {isSuper
              ? "Create a user for any company. The company’s user limit will be enforced automatically."
              : "Create a new user for your company. The company’s user limit will be enforced."}
          </p>

          <form onSubmit={handleCreateUser} className="space-y-4">
            {isSuper && (
              <div>
                <label className="block mb-1 text-[var(--foreground)]">
                  Company
                </label>
                <select
                  className="w-full p-3 rounded-xl bg-white/70 border"
                  value={targetCompanyId}
                  onChange={(e) => setTargetCompanyId(e.target.value)}
                  required
                >
                  <option value="">Select company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (users: {c.userCount}/{c.userLimit})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block mb-1 text-[var(--foreground)]">
                Email
              </label>
              <input
                type="email"
                className="w-full p-3 rounded-xl bg-white/70 border"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-[var(--foreground)]">
                Password
              </label>
              <input
                type="password"
                className="w-full p-3 rounded-xl bg-white/70 border"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-[var(--foreground)]">Role</label>
              <select
                className="w-full p-3 rounded-xl bg-white/70 border"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as "user" | "admin")}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Users can see only their own work. Admins can see all work from users in their
                company and manage users for that company.
              </p>
            </div>

            <button
              type="submit"
              disabled={creatingUser}
              className="w-full py-3 rounded-xl bg-[var(--gold)] text-black font-semibold hover:brightness-110 transition disabled:opacity-60"
            >
              {creatingUser ? "Creating user…" : "Create user"}
            </button>
          </form>
        </div>
      </div>

      {/* Super user tools: adjust user limits */}
      {isSuper && (
        <div
          className="rounded-2xl p-6 shadow-xl space-y-4 max-w-3xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Super user settings – company user limits
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            As the super user, you can control how many users each company is allowed to have.
            This should usually match their subscription plan.
          </p>

          <form onSubmit={handleUpdateLimit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block mb-1 text-[var(--foreground)]">
                Company
              </label>
              <select
                className="w-full p-3 rounded-xl bg-white/70 border"
                value={limitCompanyId}
                onChange={(e) => setLimitCompanyId(e.target.value)}
                required
              >
                <option value="">Select company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (current: {c.userCount}/{c.userLimit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-[var(--foreground)]">
                New user limit
              </label>
              <input
                type="number"
                min={1}
                className="w-32 p-3 rounded-xl bg-white/70 border"
                value={newLimit === "" ? "" : newLimit}
                onChange={(e) => {
                  const v = e.target.value;
                  setNewLimit(v === "" ? "" : Number(v));
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={updatingLimit}
              className="px-5 py-3 rounded-xl bg-[var(--gold)] text-black font-semibold hover:brightness-110 transition disabled:opacity-60"
            >
              {updatingLimit ? "Updating…" : "Update limit"}
            </button>
          </form>
        </div>
      )}

      {/* Users table */}
      <div
        className="rounded-2xl p-6 shadow-xl space-y-4"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          {isSuper ? "All users" : "Users in your company"}
        </h2>

        {users.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            No users found yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)] text-left">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Company</th>
                  <th className="py-2 pr-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--card-border)]">
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4 capitalize">{u.role}</td>
                    <td className="py-2 pr-4">
                      {u.companyName ?? "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

