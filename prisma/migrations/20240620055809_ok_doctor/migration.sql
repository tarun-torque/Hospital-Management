/*
  Warnings:

  - Added the required column `documents_type` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_picType` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "documents_type" TEXT NOT NULL,
ADD COLUMN     "profile_picType" TEXT NOT NULL;
