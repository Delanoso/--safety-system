import { CONTRACTOR_SECTIONS, type ContractorSectionId } from "@/lib/contractor-sections";

export type ContractorDocument = { section: string };

export function parseExcludedSections(
  raw: string | ContractorSectionId[] | null | undefined
): ContractorSectionId[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    const valid = new Set(CONTRACTOR_SECTIONS.map((s) => s.id));
    return raw.filter(
      (id): id is ContractorSectionId =>
        typeof id === "string" && valid.has(id as ContractorSectionId)
    );
  }
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const valid = new Set(CONTRACTOR_SECTIONS.map((s) => s.id));
    return parsed.filter((id): id is ContractorSectionId => typeof id === "string" && valid.has(id as ContractorSectionId));
  } catch {
    return [];
  }
}

export function getApplicableSections(excluded: ContractorSectionId[]) {
  const excludedSet = new Set(excluded);
  return CONTRACTOR_SECTIONS.filter((s) => !excludedSet.has(s.id));
}

export function computeContractorCompliance(
  documents: ContractorDocument[],
  excludedSectionsRaw: string | null | undefined
) {
  const excluded = parseExcludedSections(excludedSectionsRaw);
  const applicable = getApplicableSections(excluded);
  const docsBySection = new Set(documents.map((d) => d.section));

  const sections = CONTRACTOR_SECTIONS.map((s) => {
    const excludedSection = excluded.includes(s.id);
    const complete = !excludedSection && docsBySection.has(s.id);
    return {
      id: s.id,
      label: s.label,
      excluded: excludedSection,
      complete,
    };
  });

  const applicableCount = applicable.length;
  const completeCount = applicable.filter((s) => docsBySection.has(s.id)).length;
  const percentage =
    applicableCount === 0 ? 100 : Math.round((completeCount / applicableCount) * 100);

  return {
    applicableCount,
    completeCount,
    excludedCount: excluded.length,
    percentage,
    sections,
  };
}
