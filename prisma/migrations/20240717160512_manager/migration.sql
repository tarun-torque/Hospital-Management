/*
  Warnings:

  - You are about to alter the column `contact_number` on the `manager` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "manager" ALTER COLUMN "contact_number" SET DATA TYPE INTEGER;
