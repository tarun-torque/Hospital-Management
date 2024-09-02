/*
  Warnings:

  - You are about to drop the column `coverPath` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `assignedManager` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Service` table. All the data in the column will be lost.
  - Added the required column `assignedManager` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagePath` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_assignedManager_fkey";

-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "Service_title_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "coverPath",
DROP COLUMN "description",
DROP COLUMN "serviceId",
ADD COLUMN     "assignedManager" TEXT NOT NULL,
ADD COLUMN     "imagePath" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "assignedManager",
DROP COLUMN "createdAt",
DROP COLUMN "languages",
DROP COLUMN "updatedAt",
ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "language" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_assignedManager_fkey" FOREIGN KEY ("assignedManager") REFERENCES "manager"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
