-- One-off fix: ensure PPESubDepartmentItem exists in Postgres (Neon)

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

