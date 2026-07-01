-- Site Safety modules: Toolbox Talks, Induction Training, Visitor Register, Permit to Work

CREATE TABLE "ToolboxTalk" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT,
    "department" TEXT,
    "location" TEXT,
    "presenter" TEXT,
    "talkDate" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER,
    "notes" TEXT,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolboxTalk_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ToolboxTalkAttendee" (
    "id" TEXT NOT NULL,
    "talkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolboxTalkAttendee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InductionTraining" (
    "id" SERIAL NOT NULL,
    "employee" TEXT NOT NULL,
    "inductionType" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "department" TEXT,
    "trainer" TEXT,
    "notes" TEXT,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InductionTraining_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VisitorRegisterEntry" (
    "id" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "visitorCompany" TEXT,
    "idNumber" TEXT,
    "contactNumber" TEXT,
    "hostName" TEXT NOT NULL,
    "hostDepartment" TEXT,
    "purpose" TEXT,
    "location" TEXT,
    "vehicleReg" TEXT,
    "checkInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutAt" TIMESTAMP(3),
    "notes" TEXT,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisitorRegisterEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PermitToWork" (
    "id" TEXT NOT NULL,
    "permitNumber" TEXT,
    "permitType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "workDescription" TEXT,
    "department" TEXT,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "hazards" TEXT,
    "controls" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "issuerName" TEXT,
    "receiverName" TEXT,
    "fileUrl" TEXT,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermitToWork_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ToolboxTalk_companyId_idx" ON "ToolboxTalk"("companyId");
CREATE INDEX "ToolboxTalk_companyId_talkDate_idx" ON "ToolboxTalk"("companyId", "talkDate");

CREATE INDEX "ToolboxTalkAttendee_talkId_idx" ON "ToolboxTalkAttendee"("talkId");

CREATE INDEX "InductionTraining_companyId_idx" ON "InductionTraining"("companyId");
CREATE INDEX "InductionTraining_companyId_expiryDate_idx" ON "InductionTraining"("companyId", "expiryDate");

CREATE INDEX "VisitorRegisterEntry_companyId_idx" ON "VisitorRegisterEntry"("companyId");
CREATE INDEX "VisitorRegisterEntry_companyId_checkInAt_idx" ON "VisitorRegisterEntry"("companyId", "checkInAt");

CREATE INDEX "PermitToWork_companyId_idx" ON "PermitToWork"("companyId");
CREATE INDEX "PermitToWork_companyId_status_idx" ON "PermitToWork"("companyId", "status");
CREATE INDEX "PermitToWork_companyId_startDate_idx" ON "PermitToWork"("companyId", "startDate");

ALTER TABLE "ToolboxTalk" ADD CONSTRAINT "ToolboxTalk_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ToolboxTalkAttendee" ADD CONSTRAINT "ToolboxTalkAttendee_talkId_fkey" FOREIGN KEY ("talkId") REFERENCES "ToolboxTalk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InductionTraining" ADD CONSTRAINT "InductionTraining_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VisitorRegisterEntry" ADD CONSTRAINT "VisitorRegisterEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PermitToWork" ADD CONSTRAINT "PermitToWork_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
