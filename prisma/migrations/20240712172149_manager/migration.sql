/*
  Warnings:

  - You are about to drop the column `country_code` on the `Creator` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Creator` table. All the data in the column will be lost.
  - You are about to drop the column `country_code` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `country_code` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `country_code` on the `manager` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `manager` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `manager` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `manager` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `country` to the `Creator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `managerId` to the `Creator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_path` to the `manager` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Creator" DROP COLUMN "country_code",
DROP COLUMN "role",
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "managerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "country_code",
ADD COLUMN     "country" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "country_code",
ADD COLUMN     "country" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "manager" DROP COLUMN "country_code",
DROP COLUMN "verified",
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "profile_path" TEXT NOT NULL,
ADD COLUMN     "remarks" TEXT DEFAULT 'I am active',
ADD COLUMN     "status" TEXT DEFAULT 'active';

-- CreateIndex
CREATE UNIQUE INDEX "manager_username_key" ON "manager"("username");

-- CreateIndex
CREATE UNIQUE INDEX "manager_email_key" ON "manager"("email");

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "manager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
