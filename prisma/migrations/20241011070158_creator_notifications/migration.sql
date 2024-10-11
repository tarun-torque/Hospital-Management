/*
  Warnings:

  - The `isRead` column on the `managerNotification` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "managerNotification" DROP COLUMN "isRead",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;
