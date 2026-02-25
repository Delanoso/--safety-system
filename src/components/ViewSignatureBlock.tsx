"use client";

/**
 * Signature block for view pages — matches PDF layout:
 * label, signature image or line, date (or placeholder).
 */
export function ViewSignatureBlock({
  label,
  signature,
  signedAt,
}: {
  label: string;
  signature: string | null;
  signedAt?: string | null;
}) {
  return (
    <div
      className="rounded-lg border border-gray-200 dark:border-gray-600 p-4 min-w-[200px] max-w-[280px] bg-white/50 dark:bg-black/20"
    >
      <div className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">
        {label}
      </div>
      {signature ? (
        <img
          src={signature}
          alt={`${label} signature`}
          className="max-w-[220px] max-h-14 object-contain block mb-2"
        />
      ) : (
        <div className="border-b border-gray-800 dark:border-gray-300 mt-1 mb-3 min-h-10" />
      )}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Date: {(() => {
          if (!signedAt) return "_______________";
          const d = new Date(signedAt);
          return !isNaN(d.getTime()) ? d.toLocaleDateString() : "_______________";
        })()}
      </div>
    </div>
  );
}
