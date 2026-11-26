-- AlterTable
ALTER TABLE "users" ADD COLUMN "passwordResetToken" TEXT,
ADD COLUMN "passwordResetExpiresAt" TIMESTAMP(3),
ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- CreateIndex
CREATE UNIQUE INDEX "users_passwordResetToken_key" ON "users"("passwordResetToken");
