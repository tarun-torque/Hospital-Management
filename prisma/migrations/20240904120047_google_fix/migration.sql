/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `patientGoogleSingIn` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `patientGoogleSingIn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patientGoogleSingIn" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "profileUrl" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "patientGoogleSingIn_email_key" ON "patientGoogleSingIn"("email");
