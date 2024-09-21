/*
  Warnings:

  - You are about to drop the column `maximum_education` on the `Doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "maximum_education",
ADD COLUMN     "maximumEducation" TEXT;
