-- Add companyId to tables that exist (skip missing tables for partial DBs)
DO $$
BEGIN
  ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Appointment_companyId_fkey') THEN
    ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "DailyInspection" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DailyInspection_companyId_fkey') THEN
    ALTER TABLE "DailyInspection" ADD CONSTRAINT "DailyInspection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "WeeklyInspection" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WeeklyInspection_companyId_fkey') THEN
    ALTER TABLE "WeeklyInspection" ADD CONSTRAINT "WeeklyInspection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "MonthlyInspection" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MonthlyInspection_companyId_fkey') THEN
    ALTER TABLE "MonthlyInspection" ADD CONSTRAINT "MonthlyInspection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "PPEDepartment" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PPEDepartment_companyId_fkey') THEN
    ALTER TABLE "PPEDepartment" ADD CONSTRAINT "PPEDepartment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "PPEItemType" ADD COLUMN IF NOT EXISTS "companyId" TEXT;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PPEItemType_companyId_fkey') THEN
    ALTER TABLE "PPEItemType" ADD CONSTRAINT "PPEItemType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;
