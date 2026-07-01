/*
  Warnings:

  - You are about to drop the `EmergencyContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmergencyProcedure` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EvacuationDrill` table. If the table is not empty, all the data it contains will be lost.
*/

-- Drop legacy emergency response tables (PostgreSQL-compatible)
DROP TABLE IF EXISTS "EmergencyContact";
DROP TABLE IF EXISTS "EmergencyProcedure";
DROP TABLE IF EXISTS "EvacuationDrill";

