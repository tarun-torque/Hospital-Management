/*
  Warnings:

  - Added the required column `pricePerSession` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "pricePerSession" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Kanika';
