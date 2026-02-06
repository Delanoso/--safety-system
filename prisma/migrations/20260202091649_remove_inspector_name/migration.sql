-- CreateTable
CREATE TABLE "NcrReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "department" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open'
);

-- CreateTable
CREATE TABLE "NcrItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "comment" TEXT,
    "department" TEXT,
    "reportId" TEXT NOT NULL,
    CONSTRAINT "NcrItem_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "NcrReport" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NcrImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    CONSTRAINT "NcrImage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "NcrItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
