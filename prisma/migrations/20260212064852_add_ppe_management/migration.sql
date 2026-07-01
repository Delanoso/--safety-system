CREATE TABLE "PPEPerson" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "sizes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "PPEItemType" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "PPEStock" (
    "id" SERIAL PRIMARY KEY,
    "itemTypeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PPEStock_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "PPEItemType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PPEIssue" (
    "id" SERIAL PRIMARY KEY,
    "personId" INTEGER NOT NULL,
    "itemTypeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signature" TEXT,
    "signedAt" TIMESTAMP(3),
    "signToken" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending_signature',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PPEIssue_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PPEPerson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PPEIssue_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "PPEItemType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PPEStock_itemTypeId_key" ON "PPEStock"("itemTypeId");
