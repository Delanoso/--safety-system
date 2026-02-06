/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Appointment` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "appointee" TEXT NOT NULL,
    "appointer" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "appointeeEmail" TEXT,
    "appointerEmail" TEXT,
    "appointeeSignature" TEXT,
    "appointerSignature" TEXT,
    "appointeeSignedAt" DATETIME,
    "appointerSignedAt" DATETIME,
    "appointeeToken" TEXT,
    "appointerToken" TEXT
);
INSERT INTO "new_Appointment" ("appointee", "appointer", "date", "department", "id", "status", "type") SELECT "appointee", "appointer", "date", "department", "id", "status", "type" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
