/*
  Warnings:

  - You are about to drop the column `fullName` on the `membership_applications` table. All the data in the column will be lost.
  - You are about to drop the column `interestArea` on the `membership_applications` table. All the data in the column will be lost.
  - Added the required column `dateOfBirth` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `educationLevel` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expectations` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullNameEnglish` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullNameKhmer` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membershipStatus` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationality` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `occupation` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referralSource` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supportArea` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `membership_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workAddress` to the `membership_applications` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_membership_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membershipStatus" TEXT NOT NULL,
    "formerMemberYear" TEXT,
    "fullNameKhmer" TEXT NOT NULL,
    "fullNameEnglish" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "schoolName" TEXT,
    "companyName" TEXT,
    "companyIndustry" TEXT,
    "department" TEXT,
    "workAddress" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "educationLevel" TEXT NOT NULL,
    "referralSource" TEXT NOT NULL,
    "supportArea" TEXT NOT NULL,
    "expectations" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_membership_applications" ("createdAt", "email", "id", "status") SELECT "createdAt", "email", "id", "status" FROM "membership_applications";
DROP TABLE "membership_applications";
ALTER TABLE "new_membership_applications" RENAME TO "membership_applications";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
