/*
  Warnings:

  - You are about to drop the column `name` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Patient` table. All the data in the column will be lost.
  - Added the required column `doctor_name` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patient_name` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "name",
ADD COLUMN     "doctor_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "name",
ADD COLUMN     "patient_name" TEXT NOT NULL;
