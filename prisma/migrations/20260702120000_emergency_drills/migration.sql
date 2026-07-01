-- Emergency Drills module (Health & Safety)

CREATE TABLE "EmergencyDrill" (
    "id" TEXT NOT NULL,
    "drillType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "drillDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "department" TEXT,
    "coordinator" TEXT,
    "participantCount" INTEGER,
    "durationMinutes" INTEGER,
    "findings" TEXT,
    "correctiveActions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "fileUrl" TEXT,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyDrill_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmergencyDrill_companyId_idx" ON "EmergencyDrill"("companyId");
CREATE INDEX "EmergencyDrill_companyId_drillDate_idx" ON "EmergencyDrill"("companyId", "drillDate");
CREATE INDEX "EmergencyDrill_companyId_status_idx" ON "EmergencyDrill"("companyId", "status");

ALTER TABLE "EmergencyDrill" ADD CONSTRAINT "EmergencyDrill_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
