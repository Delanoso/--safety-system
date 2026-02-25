-- Create PPE department hierarchy tables if they don't exist (PostgreSQL)

-- PPEDepartment: top-level department per company
CREATE TABLE IF NOT EXISTS "PPEDepartment" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "companyId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Link PPEDepartment to Company (if not already linked)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PPEDepartment_companyId_fkey'
  ) THEN
    ALTER TABLE "PPEDepartment"
      ADD CONSTRAINT "PPEDepartment_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

-- PPESubDepartment: child under a PPEDepartment
CREATE TABLE IF NOT EXISTS "PPESubDepartment" (
  "id" SERIAL PRIMARY KEY,
  "departmentId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PPESubDepartment_departmentId_fkey'
  ) THEN
    ALTER TABLE "PPESubDepartment"
      ADD CONSTRAINT "PPESubDepartment_departmentId_fkey"
      FOREIGN KEY ("departmentId") REFERENCES "PPEDepartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

-- Ensure PPEPerson has a numeric subDepartmentId FK column matching schema.prisma
ALTER TABLE "PPEPerson" ADD COLUMN IF NOT EXISTS "subDepartmentId" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PPEPerson_subDepartmentId_fkey'
  ) THEN
    ALTER TABLE "PPEPerson"
      ADD CONSTRAINT "PPEPerson_subDepartmentId_fkey"
      FOREIGN KEY ("subDepartmentId") REFERENCES "PPESubDepartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

-- PPESubDepartmentItem: mapping sub-departments to PPE item types
CREATE TABLE IF NOT EXISTS "PPESubDepartmentItem" (
  "id" SERIAL PRIMARY KEY,
  "subDepartmentId" INTEGER NOT NULL,
  "itemTypeId" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PPESubDepartmentItem_subDepartmentId_fkey'
  ) THEN
    ALTER TABLE "PPESubDepartmentItem"
      ADD CONSTRAINT "PPESubDepartmentItem_subDepartmentId_fkey"
      FOREIGN KEY ("subDepartmentId") REFERENCES "PPESubDepartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PPESubDepartmentItem_itemTypeId_fkey'
  ) THEN
    ALTER TABLE "PPESubDepartmentItem"
      ADD CONSTRAINT "PPESubDepartmentItem_itemTypeId_fkey"
      FOREIGN KEY ("itemTypeId") REFERENCES "PPEItemType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'PPESubDepartmentItem_subDepartmentId_itemTypeId_key'
  ) THEN
    CREATE UNIQUE INDEX "PPESubDepartmentItem_subDepartmentId_itemTypeId_key"
      ON "PPESubDepartmentItem"("subDepartmentId", "itemTypeId");
  END IF;
END$$;


