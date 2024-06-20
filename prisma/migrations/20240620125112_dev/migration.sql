/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileType` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_path` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "profileType" TEXT NOT NULL,
ADD COLUMN     "profile_path" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
ALTER COLUMN "country_code" SET NOT NULL,
ALTER COLUMN "country_code" SET DATA TYPE TEXT,
ALTER COLUMN "contact_number" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_username_key" ON "Patient"("username");
