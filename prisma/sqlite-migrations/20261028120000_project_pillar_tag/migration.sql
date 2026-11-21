-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "impactReportUrl" TEXT,
    "galleryUrls" TEXT NOT NULL DEFAULT '[]',
    "partnerLogos" TEXT NOT NULL DEFAULT '[]',
    "pillar" TEXT NOT NULL DEFAULT 'COMMUNITY_IMPACT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_projects" ("id", "slug", "title", "summary", "impactReportUrl", "galleryUrls", "partnerLogos", "pillar", "createdAt", "updatedAt") SELECT "id", "slug", "title", "summary", "impactReportUrl", "galleryUrls", "partnerLogos", 'COMMUNITY_IMPACT', "createdAt", "updatedAt" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
