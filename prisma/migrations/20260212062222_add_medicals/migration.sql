-- Introduce Medicals and multi-tenant links (PostgreSQL-compatible)

-- Create Medical table matching Prisma schema
CREATE TABLE IF NOT EXISTS "Medical" (
  "id" SERIAL PRIMARY KEY,
  "employee" TEXT NOT NULL,
  "medicalType" TEXT NOT NULL,
  "issueDate" TIMESTAMP(3) NOT NULL,
  "expiryDate" TIMESTAMP(3) NOT NULL,
  "notes" TEXT,
  "fileUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure Company has userLimit (default 5)
ALTER TABLE "Company"
  ADD COLUMN IF NOT EXISTS "userLimit" INTEGER NOT NULL DEFAULT 5;

-- Add multi-tenant fields (if not already present)
ALTER TABLE "Incident"
  ADD COLUMN IF NOT EXISTS "companyId" TEXT,
  ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;

ALTER TABLE "NcrReport"
  ADD COLUMN IF NOT EXISTS "companyId" TEXT,
  ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "companyId" TEXT;

-- Add / ensure foreign keys for new relations

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Incident_companyId_fkey'
  ) THEN
    ALTER TABLE "Incident"
      ADD CONSTRAINT "Incident_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Incident_createdByUserId_fkey'
  ) THEN
    ALTER TABLE "Incident"
      ADD CONSTRAINT "Incident_createdByUserId_fkey"
      FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'NcrReport_companyId_fkey'
  ) THEN
    ALTER TABLE "NcrReport"
      ADD CONSTRAINT "NcrReport_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'NcrReport_createdByUserId_fkey'
  ) THEN
    ALTER TABLE "NcrReport"
      ADD CONSTRAINT "NcrReport_createdByUserId_fkey"
      FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_companyId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

