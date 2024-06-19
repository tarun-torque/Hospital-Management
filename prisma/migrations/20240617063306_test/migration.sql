/*
  Warnings:

  - You are about to drop the column `article_contentId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `blog_contentId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `creatorid` on the `Yt_content` table. All the data in the column will be lost.
  - You are about to drop the `Article_content` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Blog_content` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[yt_creatorId]` on the table `Yt_content` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `yt_creatorId` to the `Yt_content` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Article_content" DROP CONSTRAINT "Article_content_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Blog_content" DROP CONSTRAINT "Blog_content_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_article_contentId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_blog_contentId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_yt_contentid_fkey";

-- DropForeignKey
ALTER TABLE "Yt_content" DROP CONSTRAINT "Yt_content_creatorid_fkey";

-- DropIndex
DROP INDEX "Yt_content_creatorid_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "article_contentId",
DROP COLUMN "blog_contentId";

-- AlterTable
ALTER TABLE "Yt_content" DROP COLUMN "creatorid",
ADD COLUMN     "yt_creatorId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Article_content";

-- DropTable
DROP TABLE "Blog_content";

-- CreateIndex
CREATE UNIQUE INDEX "Yt_content_yt_creatorId_key" ON "Yt_content"("yt_creatorId");

-- AddForeignKey
ALTER TABLE "Yt_content" ADD CONSTRAINT "Yt_content_yt_creatorId_fkey" FOREIGN KEY ("yt_creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_yt_contentid_fkey" FOREIGN KEY ("yt_contentid") REFERENCES "Yt_content"("yt_creatorId") ON DELETE SET NULL ON UPDATE CASCADE;
