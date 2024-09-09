/*
  Warnings:

  - You are about to drop the column `specialities` on the `Doctor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "specialities",
ADD COLUMN     "service" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Service_title_key" ON "Service"("title");

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_service_fkey" FOREIGN KEY ("service") REFERENCES "Service"("title") ON DELETE SET NULL ON UPDATE CASCADE;
