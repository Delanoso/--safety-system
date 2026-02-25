-- AlterTable
ALTER TABLE "PPEItemType" ADD COLUMN IF NOT EXISTS "minStockThreshold" INTEGER;

-- AlterTable
ALTER TABLE "PPEItemType" ADD COLUMN IF NOT EXISTS "reorderLevel" INTEGER;
