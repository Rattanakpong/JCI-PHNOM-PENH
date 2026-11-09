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
    "dateOfBirth" DATETIME NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "referralSource" TEXT NOT NULL,
    "supportArea" TEXT NOT NULL,
    "expectations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_membership_applications" ("companyIndustry", "companyName", "createdAt", "dateOfBirth", "department", "email", "expectations", "formerMemberYear", "fullNameEnglish", "fullNameKhmer", "gender", "id", "membershipStatus", "nationality", "occupation", "phone", "referralSource", "schoolName", "status", "supportArea", "title") SELECT "companyIndustry", "companyName", "createdAt", "dateOfBirth", "department", "email", "expectations", "formerMemberYear", "fullNameEnglish", "fullNameKhmer", "gender", "id", "membershipStatus", "nationality", "occupation", "phone", "referralSource", "schoolName", "status", "supportArea", "title" FROM "membership_applications";
DROP TABLE "membership_applications";
ALTER TABLE "new_membership_applications" RENAME TO "membership_applications";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
