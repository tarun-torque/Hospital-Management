/*
  Warnings:

  - You are about to drop the column `contact_number` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `doctor_name` on the `Doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "contact_number",
DROP COLUMN "doctor_name",
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "doctorName" TEXT,
ALTER COLUMN "experience" SET DATA TYPE TEXT,
ALTER COLUMN "pricePerSession" SET DATA TYPE TEXT;
