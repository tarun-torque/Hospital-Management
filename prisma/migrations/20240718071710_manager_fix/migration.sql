/*
  Warnings:

  - You are about to drop the column `country` on the `manager` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `manager` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "manager" DROP COLUMN "country",
DROP COLUMN "state",
ADD COLUMN     "countries" TEXT[],
ADD COLUMN     "states" TEXT[];
