/*
  Warnings:

  - The primary key for the `DoctorService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `doctorId` on the `DoctorService` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `DoctorService` table. All the data in the column will be lost.
  - Added the required column `doctorUsername` to the `DoctorService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceTitle` to the `DoctorService` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DoctorService" DROP CONSTRAINT "DoctorService_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "DoctorService" DROP CONSTRAINT "DoctorService_serviceId_fkey";

-- AlterTable
ALTER TABLE "DoctorService" DROP CONSTRAINT "DoctorService_pkey",
DROP COLUMN "doctorId",
DROP COLUMN "serviceId",
ADD COLUMN     "doctorUsername" TEXT NOT NULL,
ADD COLUMN     "serviceTitle" TEXT NOT NULL,
ADD CONSTRAINT "DoctorService_pkey" PRIMARY KEY ("doctorUsername", "serviceTitle");

-- AddForeignKey
ALTER TABLE "DoctorService" ADD CONSTRAINT "DoctorService_doctorUsername_fkey" FOREIGN KEY ("doctorUsername") REFERENCES "Doctor"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorService" ADD CONSTRAINT "DoctorService_serviceTitle_fkey" FOREIGN KEY ("serviceTitle") REFERENCES "Service"("title") ON DELETE RESTRICT ON UPDATE CASCADE;
