-- Ensure PPEStockMovement table exists for Prisma model PPEStockMovement

CREATE TABLE IF NOT EXISTS "PPEStockMovement" (
  "id" SERIAL PRIMARY KEY,
  "itemTypeId" INTEGER NOT NULL,
  "movementType" TEXT NOT NULL,
  "quantityDelta" INTEGER NOT NULL,
  "quantityAfter" INTEGER NOT NULL,
  "reason" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PPEStockMovement_itemTypeId_fkey'
  ) THEN
    ALTER TABLE "PPEStockMovement"
      ADD CONSTRAINT "PPEStockMovement_itemTypeId_fkey"
      FOREIGN KEY ("itemTypeId") REFERENCES "PPEItemType"("id") ON DELETE CASCADE;
  END IF;
END$$;

