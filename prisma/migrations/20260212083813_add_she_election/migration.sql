/*
  Warnings:

  - You are about to drop the `SHECommitteeMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SHECommitteeMember";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SHEElection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SHEElection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SHEElectionCandidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "electionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SHEElectionCandidate_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "SHEElection" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SHEElectionVoter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "electionId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "voteToken" TEXT NOT NULL,
    "candidateId" TEXT,
    "votedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SHEElectionVoter_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "SHEElection" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SHEElectionVoter_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "SHEElectionCandidate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SHEElectionVoter_voteToken_key" ON "SHEElectionVoter"("voteToken");
