/*
  Warnings:

  - Added the required column `profile_path` to the `Creator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_type` to the `Creator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "profile_path" TEXT NOT NULL,
ADD COLUMN     "profile_type" TEXT NOT NULL;
