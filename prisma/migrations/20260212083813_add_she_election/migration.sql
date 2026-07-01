/*
  Warnings:

  - You are about to drop the `SHECommitteeMember` table. If the table is not empty, all the data it contains will be lost.
*/

-- Remove legacy SHECommitteeMember table (no longer used)
DROP TABLE IF EXISTS "SHECommitteeMember";

-- SHE elections: core tables
CREATE TABLE IF NOT EXISTS "SHEElection" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "companyId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SHEElection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SHEElectionCandidate" (
  "id" TEXT NOT NULL,
  "electionId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "department" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SHEElectionCandidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SHEElectionVoter" (
  "id" TEXT NOT NULL,
  "electionId" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "voteToken" TEXT NOT NULL,
  "candidateId" TEXT,
  "votedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SHEElectionVoter_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SHEElection_companyId_fkey'
  ) THEN
    ALTER TABLE "SHEElection"
      ADD CONSTRAINT "SHEElection_companyId_fkey"
      FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SHEElectionCandidate_electionId_fkey'
  ) THEN
    ALTER TABLE "SHEElectionCandidate"
      ADD CONSTRAINT "SHEElectionCandidate_electionId_fkey"
      FOREIGN KEY ("electionId") REFERENCES "SHEElection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SHEElectionVoter_electionId_fkey'
  ) THEN
    ALTER TABLE "SHEElectionVoter"
      ADD CONSTRAINT "SHEElectionVoter_electionId_fkey"
      FOREIGN KEY ("electionId") REFERENCES "SHEElection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'SHEElectionVoter_candidateId_fkey'
  ) THEN
    ALTER TABLE "SHEElectionVoter"
      ADD CONSTRAINT "SHEElectionVoter_candidateId_fkey"
      FOREIGN KEY ("candidateId") REFERENCES "SHEElectionCandidate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

-- Unique voteToken
CREATE UNIQUE INDEX IF NOT EXISTS "SHEElectionVoter_voteToken_key" ON "SHEElectionVoter"("voteToken");

