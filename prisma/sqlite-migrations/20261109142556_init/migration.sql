/*
  Warnings:

  - You are about to drop the column `proofUrl` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `telegramHandle` on the `registrations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "news_posts" ADD COLUMN "coverCaption" TEXT;

-- AlterTable
ALTER TABLE "ticket_tiers" ADD COLUMN "saleEndsAt" DATETIME;

-- CreateTable
CREATE TABLE "news_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "newsPostId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "news_photos_newsPostId_fkey" FOREIGN KEY ("newsPostId") REFERENCES "news_posts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "mapUrl" TEXT,
    "bannerUrl" TEXT,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "telegramGroupUrl" TEXT,
    "speakers" TEXT NOT NULL DEFAULT '[]',
    "agenda" TEXT NOT NULL DEFAULT '[]',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "organizerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_events" ("bannerUrl", "createdAt", "description", "endAt", "id", "location", "mapUrl", "organizerId", "published", "slug", "speakers", "startAt", "telegramGroupUrl", "title", "updatedAt") SELECT "bannerUrl", "createdAt", "description", "endAt", "id", "location", "mapUrl", "organizerId", "published", "slug", "speakers", "startAt", "telegramGroupUrl", "title", "updatedAt" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");
CREATE INDEX "events_startAt_idx" ON "events"("startAt");
CREATE TABLE "new_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL,
    "amountUsd" REAL NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'ABA_KHQR',
    "qrPayload" TEXT NOT NULL,
    "qrMd5" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedById" TEXT,
    "verifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payments_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payments_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_payments" ("amountUsd", "createdAt", "id", "method", "qrMd5", "qrPayload", "registrationId", "status", "updatedAt", "verifiedAt", "verifiedById") SELECT "amountUsd", "createdAt", "id", "method", "qrMd5", "qrPayload", "registrationId", "status", "updatedAt", "verifiedAt", "verifiedById" FROM "payments";
DROP TABLE "payments";
ALTER TABLE "new_payments" RENAME TO "payments";
CREATE UNIQUE INDEX "payments_registrationId_key" ON "payments"("registrationId");
CREATE TABLE "new_registrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "ticketTierId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isJciMember" BOOLEAN NOT NULL DEFAULT false,
    "jciChapter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "checkedInAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "registrations_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "ticket_tiers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_registrations" ("checkedInAt", "createdAt", "email", "eventId", "fullName", "id", "phone", "status", "ticketTierId", "updatedAt") SELECT "checkedInAt", "createdAt", "email", "eventId", "fullName", "id", "phone", "status", "ticketTierId", "updatedAt" FROM "registrations";
DROP TABLE "registrations";
ALTER TABLE "new_registrations" RENAME TO "registrations";
CREATE INDEX "registrations_eventId_status_idx" ON "registrations"("eventId", "status");
CREATE UNIQUE INDEX "registrations_eventId_email_key" ON "registrations"("eventId", "email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "news_photos_newsPostId_idx" ON "news_photos"("newsPostId");
