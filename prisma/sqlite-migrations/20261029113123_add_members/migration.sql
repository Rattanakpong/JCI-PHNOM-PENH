-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "businessName" TEXT,
    "jobTitle" TEXT,
    "industry" TEXT,
    "bio" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "socialUrl" TEXT,
    "joinYear" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "members_slug_key" ON "members"("slug");

-- CreateIndex
CREATE INDEX "members_joinYear_idx" ON "members"("joinYear");
