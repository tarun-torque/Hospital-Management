/*
  Warnings:

  - You are about to drop the column `managerId` on the `Doctor` table. All the data in the column will be lost.
  - Made the column `assignedManager` on table `Creator` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `gender` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Creator" DROP CONSTRAINT "Creator_assignedManager_fkey";

-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_managerId_fkey";

-- AlterTable
ALTER TABLE "Creator" ALTER COLUMN "assignedManager" SET NOT NULL;

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "managerId",
ADD COLUMN     "assignedManager" TEXT NOT NULL DEFAULT 'noManager',
ADD COLUMN     "gender" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_assignedManager_fkey" FOREIGN KEY ("assignedManager") REFERENCES "manager"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_assignedManager_fkey" FOREIGN KEY ("assignedManager") REFERENCES "manager"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
