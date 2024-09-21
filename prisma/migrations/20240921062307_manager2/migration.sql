/*
  Warnings:

  - You are about to drop the column `type` on the `managerNotification` table. All the data in the column will be lost.
  - Added the required column `data` to the `managerNotification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "managerNotification" DROP COLUMN "type",
ADD COLUMN     "data" TEXT NOT NULL;
