/*
  Warnings:

  - Added the required column `imageUrl` to the `recentTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "recentTicket" ADD COLUMN     "imageUrl" TEXT NOT NULL;
