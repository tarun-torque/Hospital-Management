/*
  Warnings:

  - You are about to drop the column `contact_number` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `new_patient` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `patient_name` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `profileType` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `profile_path` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the `deviceTokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patientGoogleSingIn` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fcmToken` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Made the column `username` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Patient` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "deviceTokens" DROP CONSTRAINT "deviceTokens_patientId_fkey";

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "contact_number",
DROP COLUMN "new_patient",
DROP COLUMN "patient_name",
DROP COLUMN "profileType",
DROP COLUMN "profile_path",
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fcmToken" TEXT NOT NULL,
ADD COLUMN     "patientName" TEXT,
ADD COLUMN     "profileUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "deviceTokens";

-- DropTable
DROP TABLE "patientGoogleSingIn";
