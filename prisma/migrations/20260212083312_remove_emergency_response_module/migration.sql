/*
  Warnings:

  - You are about to drop the `EmergencyContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmergencyProcedure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EvacuationDrill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmergencyContact";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmergencyProcedure";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EvacuationDrill";
PRAGMA foreign_keys=on;
