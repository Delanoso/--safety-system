-- One-off fix: ensure PPESizeReminderToken exists in Postgres (Neon)

CREATE TABLE IF NOT EXISTS "PPESizeReminderToken" (
  "id" SERIAL PRIMARY KEY,
  "personId" INTEGER NOT NULL,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "usedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'PPESizeReminderToken_personId_fkey'
  ) THEN
    ALTER TABLE "PPESizeReminderToken"
      ADD CONSTRAINT "PPESizeReminderToken_personId_fkey"
      FOREIGN KEY ("personId") REFERENCES "PPEPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'PPESizeReminderToken_token_key'
  ) THEN
    CREATE UNIQUE INDEX "PPESizeReminderToken_token_key"
      ON "PPESizeReminderToken"("token");
  END IF;
END$$;

