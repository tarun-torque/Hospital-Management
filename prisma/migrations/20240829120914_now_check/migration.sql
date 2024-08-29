/*
  Warnings:

  - Made the column `assignedManager` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_assignedManager_fkey";

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "assignedManager" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_assignedManager_fkey" FOREIGN KEY ("assignedManager") REFERENCES "manager"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
