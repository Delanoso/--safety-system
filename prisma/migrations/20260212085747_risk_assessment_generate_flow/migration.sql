-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RiskAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "location" TEXT,
    "assessor" TEXT,
    "riskLevel" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3),
    "controls" TEXT,
    "fileUrl" TEXT,
    "companyId" TEXT,
    "industrySector" TEXT,
    "assessmentType" TEXT,
    "description" TEXT,
    "signature" TEXT,
    "signedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RiskAssessment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RiskAssessment" ("assessor", "companyId", "controls", "createdAt", "department", "fileUrl", "id", "location", "reviewDate", "riskLevel", "title") SELECT "assessor", "companyId", "controls", "createdAt", "department", "fileUrl", "id", "location", "reviewDate", "riskLevel", "title" FROM "RiskAssessment";
DROP TABLE "RiskAssessment";
ALTER TABLE "new_RiskAssessment" RENAME TO "RiskAssessment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
