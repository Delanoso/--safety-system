-- Toolbox talk attendee signatures for audit register

ALTER TABLE "ToolboxTalkAttendee" ADD COLUMN IF NOT EXISTS "signature" TEXT;
ALTER TABLE "ToolboxTalkAttendee" ADD COLUMN IF NOT EXISTS "signedAt" TIMESTAMP(3);
ALTER TABLE "ToolboxTalkAttendee" ADD COLUMN IF NOT EXISTS "signToken" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "ToolboxTalkAttendee_signToken_key" ON "ToolboxTalkAttendee"("signToken");

UPDATE "ToolboxTalkAttendee"
SET "signToken" = encode(gen_random_bytes(24), 'hex')
WHERE "signToken" IS NULL AND "signature" IS NULL;
