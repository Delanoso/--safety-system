/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable (PostgreSQL: no PRAGMA; use ALTER TABLE)
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "createdAt";
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "appointeeSignature" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "appointerSignature" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "appointeeSignedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "appointerSignedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "appointeeToken" TEXT;
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "appointerToken" TEXT;
