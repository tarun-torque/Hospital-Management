/*
  Warnings:

  - Made the column `patientId` on table `recentTicket` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "recentTicket" DROP CONSTRAINT "recentTicket_patientId_fkey";

-- AlterTable
ALTER TABLE "recentTicket" ALTER COLUMN "patientId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "recentTicket" ADD CONSTRAINT "recentTicket_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
