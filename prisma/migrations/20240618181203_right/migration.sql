/*
  Warnings:

  - You are about to drop the column `language` on the `Creator` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Creator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Creator" DROP COLUMN "language",
DROP COLUMN "state";
