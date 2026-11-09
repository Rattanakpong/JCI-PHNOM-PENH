-- CreateTable
CREATE TABLE "project_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "project_photos_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "project_photos_projectId_year_idx" ON "project_photos"("projectId", "year");

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "impactReportUrl" TEXT,
    "partnerLogos" TEXT NOT NULL DEFAULT '[]',
    "pillar" TEXT NOT NULL DEFAULT 'COMMUNITY_IMPACT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_projects" ("id", "slug", "title", "summary", "impactReportUrl", "partnerLogos", "pillar", "createdAt", "updatedAt") SELECT "id", "slug", "title", "summary", "impactReportUrl", "partnerLogos", "pillar", "createdAt", "updatedAt" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
