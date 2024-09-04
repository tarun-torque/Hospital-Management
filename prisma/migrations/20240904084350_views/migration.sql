/*
  Warnings:

  - Made the column `categoryId` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_categoryId_fkey";

-- AlterTable
ALTER TABLE "Article_content" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Blog_content" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "categoryId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Yt_content" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "deviceTokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "doctorId" INTEGER,
    "patientId" INTEGER,

    CONSTRAINT "deviceTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "deviceTokens_token_key" ON "deviceTokens"("token");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deviceTokens" ADD CONSTRAINT "deviceTokens_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deviceTokens" ADD CONSTRAINT "deviceTokens_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
