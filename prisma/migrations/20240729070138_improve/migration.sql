/*
  Warnings:

  - You are about to drop the column `managerId` on the `Service` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_managerId_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "managerId";

-- AlterTable
ALTER TABLE "manager" ADD COLUMN     "service" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Service_title_key" ON "Service"("title");

-- AddForeignKey
ALTER TABLE "manager" ADD CONSTRAINT "manager_service_fkey" FOREIGN KEY ("service") REFERENCES "Service"("title") ON DELETE SET NULL ON UPDATE CASCADE;
