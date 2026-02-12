"use client";

import { useEffect, useState } from "react";

const LEGAL_STORAGE_KEY = "legalNoticeAccepted";

export function LegalNoticeModal() {
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (r.ok) {
          try {
            if (!sessionStorage.getItem(LEGAL_STORAGE_KEY)) {
              setShow(true);
            }
          } catch {
            setShow(true);
          }
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  const handleAccept = () => {
    try {
      sessionStorage.setItem(LEGAL_STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setShow(false);
  };

  if (checking || !show) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-8 shadow-2xl bg-white"
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Intellectual Property Notice
        </h2>

        <div className="space-y-4 text-sm text-gray-800 leading-relaxed">
          <p>
            <strong>This web application is the intellectual property of Delano Solutions.</strong>{" "}
            All rights reserved.
          </p>

          <p>
            This software, including but not limited to its source code, design, structure,
            compilation, and user interface, may not be copied, reproduced, distributed,
            modified, reverse-engineered, disassembled, decompiled, or otherwise exploited
            without the prior written consent of Delano Solutions.
          </p>

          <p>
            Unauthorized use, copying, or distribution of this application or any of its
            components constitutes a violation of intellectual property laws and may result
            in legal action.
          </p>

          <p>
            By accessing and using this application, you acknowledge that you have read,
            understood, and agree to respect these intellectual property rights. You may
            not create derivative works, sublicense, or transfer any rights to third parties
            without explicit authorization from Delano Solutions.
          </p>

          <p className="pt-2 text-xs text-gray-600">
            © {new Date().getFullYear()} Delano Solutions. All rights reserved.
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-xl bg-[var(--gold)] px-6 py-3 font-semibold text-black transition hover:brightness-110"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
