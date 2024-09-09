/*
  Warnings:

  - You are about to drop the column `service` on the `Doctor` table. All the data in the column will be lost.
  - Added the required column `price` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_service_fkey";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "service";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "price" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "DoctorService" (
    "doctorId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "DoctorService_pkey" PRIMARY KEY ("doctorId","serviceId")
);

-- AddForeignKey
ALTER TABLE "DoctorService" ADD CONSTRAINT "DoctorService_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorService" ADD CONSTRAINT "DoctorService_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
