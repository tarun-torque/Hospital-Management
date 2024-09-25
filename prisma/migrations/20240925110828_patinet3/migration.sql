/*
  Warnings:

  - You are about to drop the column `username` on the `Patient` table. All the data in the column will be lost.
  - Made the column `patientName` on table `Patient` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Patient_username_key";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "username",
ALTER COLUMN "patientName" SET NOT NULL;
