/*
  Warnings:

  - You are about to drop the `CostAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncidentDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncidentRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable (PostgreSQL: no PRAGMA)
DROP TABLE IF EXISTS "CostAnalysis";
DROP TABLE IF EXISTS "IncidentDocument";
DROP TABLE IF EXISTS "IncidentRecord";

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "department" TEXT,
    "employee" TEXT,
    "employeeId" TEXT,
    "location" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "linkId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentImage" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IncidentImage_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "IncidentImage" ADD CONSTRAINT "IncidentImage_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;
