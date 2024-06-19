/*
  Warnings:

  - Added the required column `articleImagePath` to the `Article_content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `articleImageType` to the `Article_content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Creator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Article_content" ADD COLUMN     "articleImagePath" TEXT NOT NULL,
ADD COLUMN     "articleImageType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "language" TEXT[],
ADD COLUMN     "state" TEXT NOT NULL;
