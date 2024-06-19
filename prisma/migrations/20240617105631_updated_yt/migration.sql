/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_yt_contentid_fkey";

-- DropIndex
DROP INDEX "Yt_content_yt_creatorId_key";

-- AlterTable
ALTER TABLE "Yt_content" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Yt_content_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Category";
