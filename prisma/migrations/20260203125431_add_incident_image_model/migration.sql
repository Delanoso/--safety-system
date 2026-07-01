-- Investigation team + signature tokens for incidents (PostgreSQL-compatible)

-- InvestigationTeamMember table
CREATE TABLE IF NOT EXISTS "InvestigationTeamMember" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "designation" TEXT NOT NULL,
  "signature" TEXT,
  "incidentId" TEXT NOT NULL,
  "signedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvestigationTeamMember_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'InvestigationTeamMember_incidentId_fkey'
  ) THEN
    ALTER TABLE "InvestigationTeamMember"
      ADD CONSTRAINT "InvestigationTeamMember_incidentId_fkey"
      FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END$$;

-- SignatureToken table for incident signatures
CREATE TABLE IF NOT EXISTS "SignatureToken" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "incidentId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SignatureToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SignatureToken_token_key" ON "SignatureToken"("token");

