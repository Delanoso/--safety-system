-- CreateTable
CREATE TABLE "IncidentRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "linkId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "employee" TEXT NOT NULL,
    "employeeId" TEXT,
    "location" TEXT,
    "date" DATETIME NOT NULL,
    "severity" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CostAnalysis_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "IncidentRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IncidentDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "linkId" TEXT,
    "incidentId" TEXT,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IncidentDocument_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "IncidentRecord" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
