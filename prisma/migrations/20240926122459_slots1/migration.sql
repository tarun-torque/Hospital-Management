/*
  Warnings:

  - You are about to drop the column `isBooked` on the `DoctorAvailability` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "isCompleted" TEXT NOT NULL DEFAULT 'false',
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "DoctorAvailability" DROP COLUMN "isBooked";

-- CreateTable
CREATE TABLE "availableSlots" (
    "id" SERIAL NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availableSlots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "availableSlots" ADD CONSTRAINT "availableSlots_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
