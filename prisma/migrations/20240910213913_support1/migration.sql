/*
  Warnings:

  - The primary key for the `Support` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Support` table. All the data in the column will be lost.
  - Added the required column `image` to the `Support` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Support" DROP CONSTRAINT "Support_patientId_fkey";

-- AlterTable
ALTER TABLE "Support" DROP CONSTRAINT "Support_pkey",
DROP COLUMN "id",
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "int" SERIAL NOT NULL,
ALTER COLUMN "patientId" DROP NOT NULL,
ADD CONSTRAINT "Support_pkey" PRIMARY KEY ("int");

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
