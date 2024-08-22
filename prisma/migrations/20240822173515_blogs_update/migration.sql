/*
  Warnings:

  - You are about to drop the column `blogImagePath` on the `Blog_content` table. All the data in the column will be lost.
  - You are about to drop the column `blogImageType` on the `Blog_content` table. All the data in the column will be lost.
  - You are about to drop the column `heading` on the `Blog_content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Blog_content" DROP COLUMN "blogImagePath",
DROP COLUMN "blogImageType",
DROP COLUMN "heading";
