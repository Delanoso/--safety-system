-- Add surname, idNumber, companyPersonId to toolbox talk attendees

ALTER TABLE "ToolboxTalkAttendee" ADD COLUMN IF NOT EXISTS "surname" TEXT;
ALTER TABLE "ToolboxTalkAttendee" ADD COLUMN IF NOT EXISTS "idNumber" TEXT;
ALTER TABLE "ToolboxTalkAttendee" ADD COLUMN IF NOT EXISTS "companyPersonId" TEXT;

CREATE INDEX IF NOT EXISTS "ToolboxTalkAttendee_talkId_idx" ON "ToolboxTalkAttendee"("talkId");
