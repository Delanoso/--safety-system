-- CreateTable
CREATE TABLE "CostAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "linkId" TEXT,
    "incidentId" TEXT,
    "directCost" REAL,
    "indirectCost" REAL,
    "otherCost" REAL,
    "totalCost" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CostAnalysis_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
