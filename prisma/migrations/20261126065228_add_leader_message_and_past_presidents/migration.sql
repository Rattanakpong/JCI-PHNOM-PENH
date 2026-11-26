-- AlterTable
ALTER TABLE "board_members" ADD COLUMN     "message" TEXT;

-- CreateTable
CREATE TABLE "past_presidents" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "past_presidents_pkey" PRIMARY KEY ("id")
);
