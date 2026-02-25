-- AlterTable
ALTER TABLE "User" ADD COLUMN "inspectionDepartments" TEXT;

-- AlterTable
ALTER TABLE "DailyInspection" ADD COLUMN "inspectionType" TEXT;

-- AlterTable
ALTER TABLE "WeeklyInspection" ADD COLUMN "inspectionType" TEXT;

-- AlterTable
ALTER TABLE "MonthlyInspection" ADD COLUMN "inspectionType" TEXT;
