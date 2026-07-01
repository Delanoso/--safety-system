-- AlterTable
ALTER TABLE "LegalComplianceItem" ADD COLUMN IF NOT EXISTS "auditRef" TEXT;
ALTER TABLE "LegalComplianceItem" ADD COLUMN IF NOT EXISTS "section" TEXT;
ALTER TABLE "LegalComplianceItem" ADD COLUMN IF NOT EXISTS "subsection" TEXT;
ALTER TABLE "LegalComplianceItem" ADD COLUMN IF NOT EXISTS "weight" INTEGER;
ALTER TABLE "LegalComplianceItem" ADD COLUMN IF NOT EXISTS "achieved" TEXT;
ALTER TABLE "LegalComplianceItem" ADD COLUMN IF NOT EXISTS "score" INTEGER;
ALTER TABLE "LegalComplianceItem" ADD COLUMN IF NOT EXISTS "observations" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LegalComplianceItem_companyId_section_idx" ON "LegalComplianceItem"("companyId", "section");

-- CreateIndex (unique audit ref per company; multiple NULL auditRef allowed in PostgreSQL)
CREATE UNIQUE INDEX IF NOT EXISTS "LegalComplianceItem_companyId_auditRef_key" ON "LegalComplianceItem"("companyId", "auditRef");
