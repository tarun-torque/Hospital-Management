/*
  Warnings:

  - The primary key for the `Support` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `int` on the `Support` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Support" DROP CONSTRAINT "Support_pkey",
DROP COLUMN "int",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Support_pkey" PRIMARY KEY ("id");
