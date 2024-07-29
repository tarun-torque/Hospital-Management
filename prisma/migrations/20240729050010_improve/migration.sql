/*
  Warnings:

  - You are about to drop the column `managerId` on the `Creator` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Creator" DROP CONSTRAINT "Creator_managerId_fkey";

-- AlterTable
ALTER TABLE "Creator" DROP COLUMN "managerId",
ADD COLUMN     "assignedManager" TEXT;

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_assignedManager_fkey" FOREIGN KEY ("assignedManager") REFERENCES "manager"("username") ON DELETE SET NULL ON UPDATE CASCADE;
