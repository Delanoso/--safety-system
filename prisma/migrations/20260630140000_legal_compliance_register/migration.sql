-- CreateTable
CREATE TABLE "LegalComplianceItem" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "legislation" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "appliesTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'under_review',
    "responsiblePerson" TEXT,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewDue" TIMESTAMP(3),
    "evidenceUrl" TEXT,
    "evidenceNotes" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalComplianceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LegalComplianceItem_companyId_idx" ON "LegalComplianceItem"("companyId");

-- CreateIndex
CREATE INDEX "LegalComplianceItem_companyId_status_idx" ON "LegalComplianceItem"("companyId", "status");

-- CreateIndex
CREATE INDEX "LegalComplianceItem_companyId_nextReviewDue_idx" ON "LegalComplianceItem"("companyId", "nextReviewDue");

-- AddForeignKey
ALTER TABLE "LegalComplianceItem" ADD CONSTRAINT "LegalComplianceItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
