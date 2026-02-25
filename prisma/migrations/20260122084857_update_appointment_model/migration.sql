/*
  Warnings:

  - You are about to drop the column `signatureFile` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `signedAt` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Appointment` table. All the data in the column will be lost.

*/
-- AlterTable (PostgreSQL)
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "signatureFile";
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "signedAt";
ALTER TABLE "Appointment" DROP COLUMN IF EXISTS "updatedAt";
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'draft';
