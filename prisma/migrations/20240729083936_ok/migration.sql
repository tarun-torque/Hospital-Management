/*
  Warnings:

  - You are about to drop the column `managerId` on the `Service` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_managerId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "managerId";

-- CreateIndex
CREATE UNIQUE INDEX "Service_title_key" ON "Service"("title");
