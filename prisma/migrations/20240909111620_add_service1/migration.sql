/*
  Warnings:

  - The primary key for the `DoctorService` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `doctorUsername` on the `DoctorService` table. All the data in the column will be lost.
  - You are about to drop the column `serviceTitle` on the `DoctorService` table. All the data in the column will be lost.
  - Added the required column `servicTitle` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `DoctorService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `DoctorService` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DoctorService" DROP CONSTRAINT "DoctorService_doctorUsername_fkey";

-- DropForeignKey
ALTER TABLE "DoctorService" DROP CONSTRAINT "DoctorService_serviceTitle_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "servicTitle" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DoctorService" DROP CONSTRAINT "DoctorService_pkey",
DROP COLUMN "doctorUsername",
DROP COLUMN "serviceTitle",
ADD COLUMN     "doctorId" INTEGER NOT NULL,
ADD COLUMN     "serviceId" INTEGER NOT NULL,
ADD CONSTRAINT "DoctorService_pkey" PRIMARY KEY ("doctorId", "serviceId");

-- AddForeignKey
ALTER TABLE "DoctorService" ADD CONSTRAINT "DoctorService_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorService" ADD CONSTRAINT "DoctorService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
