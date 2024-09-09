/*
  Warnings:

  - You are about to drop the column `documents_type` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `profile_pic` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picType` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `deviceTokens` table. All the data in the column will be lost.
  - Added the required column `fcmToken` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "deviceTokens" DROP CONSTRAINT "deviceTokens_doctorId_fkey";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "documents_type",
DROP COLUMN "profile_pic",
DROP COLUMN "profile_picType",
ADD COLUMN     "fcmToken" TEXT NOT NULL,
ADD COLUMN     "profileUrl" TEXT,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "experience" DROP NOT NULL,
ALTER COLUMN "maximum_education" DROP NOT NULL,
ALTER COLUMN "documents" DROP NOT NULL,
ALTER COLUMN "contact_number" DROP NOT NULL,
ALTER COLUMN "doctor_name" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "pricePerSession" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL;

-- AlterTable
ALTER TABLE "deviceTokens" DROP COLUMN "doctorId";
