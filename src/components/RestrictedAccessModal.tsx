"use client";

import { useRouter } from "next/navigation";

interface RestrictedAccessModalProps {
  open: boolean;
  onClose?: () => void;
  /** If true, show "Go to Dashboard" and call onClose when navigating */
  showGoToDashboard?: boolean;
}

export default function RestrictedAccessModal({
  open,
  onClose,
  showGoToDashboard = true,
}: RestrictedAccessModalProps) {
  const router = useRouter();

  if (!open) return null;

  const goToDashboard = () => {
    onClose?.();
    router.push("/dashboard");
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Restricted access
        </h2>
        <p className="text-[var(--muted-foreground)]">
          You do not have permission to access this module. If you need access,
          please contact your administrator.
        </p>
        <div className="flex gap-3 justify-end">
          {showGoToDashboard && (
            <button
              type="button"
              onClick={goToDashboard}
              className="px-4 py-2 rounded-xl font-semibold transition"
              style={{
                background: "var(--gold)",
                color: "black",
              }}
            >
              Go to Dashboard
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--card-border)] hover:opacity-80 transition"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
