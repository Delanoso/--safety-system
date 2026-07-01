-- Align RiskAssessment table with current Prisma schema (PostgreSQL)

-- Add new columns if they do not already exist
ALTER TABLE "RiskAssessment"
  ADD COLUMN IF NOT EXISTS "industrySector" TEXT,
  ADD COLUMN IF NOT EXISTS "assessmentType" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "signature" TEXT,
  ADD COLUMN IF NOT EXISTS "signedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Company relation
ALTER TABLE "RiskAssessment"
  ADD COLUMN IF NOT EXISTS "companyId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'RiskAssessment_companyId_fkey'
  ) THEN
    ALTER TABLE "RiskAssessment"
      ADD CONSTRAINT "RiskAssessment_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

