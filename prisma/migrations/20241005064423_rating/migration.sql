/*
  Warnings:

  - You are about to drop the `doctorNotification` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `value` on the `continum` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "doctorNotification" DROP CONSTRAINT "doctorNotification_doctorId_fkey";

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "isPublic" TEXT NOT NULL DEFAULT 'no';

-- AlterTable
ALTER TABLE "continum" DROP COLUMN "value",
ADD COLUMN     "value" INTEGER NOT NULL;

-- DropTable
DROP TABLE "doctorNotification";
