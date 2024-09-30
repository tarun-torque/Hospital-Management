/*
  Warnings:

  - Added the required column `updatedAt` to the `Mood` table without a default value. This is not possible if the table is not empty.
  - Made the column `note` on table `Mood` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Mood" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "factor" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "note" SET NOT NULL;
