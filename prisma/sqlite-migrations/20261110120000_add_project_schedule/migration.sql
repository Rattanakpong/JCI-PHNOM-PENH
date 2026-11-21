-- AlterTable
ALTER TABLE "projects" ADD COLUMN "endDate" DATETIME;
ALTER TABLE "projects" ADD COLUMN "location" TEXT;
ALTER TABLE "projects" ADD COLUMN "startDate" DATETIME;

-- CreateIndex
CREATE INDEX "projects_startDate_idx" ON "projects"("startDate");

