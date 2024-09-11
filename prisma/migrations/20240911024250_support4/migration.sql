/*
  Warnings:

  - The `noOfBooking` column on the `Doctor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "noOfBooking",
ADD COLUMN     "noOfBooking" INTEGER DEFAULT 0;
