-- Company people (non-login employees) for incidents, medicals, etc.
CREATE TABLE IF NOT EXISTS "CompanyPerson" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "surname" TEXT,
  "employeeNumber" TEXT,
  "idNumber" TEXT,
  "occupation" TEXT,
  "department" TEXT,
  "supervisor" TEXT,
  "contactNumber" TEXT,
  "address" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyPerson_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CompanyPerson_companyId_idx" ON "CompanyPerson"("companyId");
CREATE INDEX IF NOT EXISTS "CompanyPerson_companyId_employeeNumber_idx" ON "CompanyPerson"("companyId", "employeeNumber");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CompanyPerson_companyId_fkey'
  ) THEN
    ALTER TABLE "CompanyPerson"
      ADD CONSTRAINT "CompanyPerson_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

-- SHE rep inspections (uploaded inspection forms)
CREATE TABLE IF NOT EXISTS "SHERepInspection" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "period" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "fileUrl" TEXT,
  "fileName" TEXT,
  "companyId" TEXT,
  "uploadedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SHERepInspection_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SHERepInspection_companyId_fkey'
  ) THEN
    ALTER TABLE "SHERepInspection"
      ADD CONSTRAINT "SHERepInspection_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;
