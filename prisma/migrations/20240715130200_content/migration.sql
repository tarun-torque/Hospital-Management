/*
  Warnings:

  - Added the required column `description` to the `ContentCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_path` to the `ContentCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContentCategory" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "image_path" TEXT NOT NULL;
