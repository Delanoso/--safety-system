"use client";

import { CONTRACTOR_SECTIONS, type ContractorSectionId } from "@/lib/contractor-sections";
import { parseExcludedSections } from "@/lib/contractor-compliance";

type Props = {
  excluded: ContractorSectionId[];
  onChange: (excluded: ContractorSectionId[]) => void;
  disabled?: boolean;
};

export default function ContractorSectionSelector({ excluded, onChange, disabled }: Props) {
  const excludedSet = new Set(excluded);

  function toggle(id: ContractorSectionId) {
    if (disabled) return;
    if (excludedSet.has(id)) {
      onChange(excluded.filter((x) => x !== id));
    } else {
      onChange([...excluded, id]);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-black">Applicable safety file sections</h3>
        <p className="text-xs text-black/60 mt-1">
          Uncheck sections that do not apply to this contractor. Excluded sections will not count against their compliance score.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-3 rounded-lg border border-white/40 bg-white/50">
        {CONTRACTOR_SECTIONS.map(({ id, label }) => {
          const applicable = !excludedSet.has(id);
          return (
            <label
              key={id}
              className={`flex items-start gap-2 text-sm cursor-pointer p-2 rounded ${applicable ? "text-black" : "text-black/50"}`}
            >
              <input
                type="checkbox"
                checked={applicable}
                disabled={disabled}
                onChange={() => toggle(id)}
                className="mt-0.5"
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
      <p className="text-xs text-black/60">
        {CONTRACTOR_SECTIONS.length - excluded.length} of {CONTRACTOR_SECTIONS.length} sections apply
        {excluded.length > 0 ? ` (${excluded.length} marked N/A)` : ""}
      </p>
    </div>
  );
}

export function excludedFromContractor(raw: string | null | undefined) {
  return parseExcludedSections(raw);
}
