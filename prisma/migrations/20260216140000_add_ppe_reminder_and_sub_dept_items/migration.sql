-- CreateTable
CREATE TABLE "PPESubDepartmentItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subDepartmentId" INTEGER NOT NULL,
    "itemTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PPESubDepartmentItem_subDepartmentId_fkey" FOREIGN KEY ("subDepartmentId") REFERENCES "PPESubDepartment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PPESubDepartmentItem_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "PPEItemType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PPESizeReminderToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "personId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PPESizeReminderToken_personId_fkey" FOREIGN KEY ("personId") REFERENCES "PPEPerson" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PPESubDepartmentItem_subDepartmentId_itemTypeId_key" ON "PPESubDepartmentItem"("subDepartmentId", "itemTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "PPESizeReminderToken_token_key" ON "PPESizeReminderToken"("token");
