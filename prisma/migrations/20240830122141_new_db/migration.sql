/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Made the column `assignedManager` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_assignedManager_fkey";

-- AlterTable
ALTER TABLE "Patient" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "contact_number" DROP NOT NULL,
ALTER COLUMN "dob" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL,
ALTER COLUMN "new_patient" DROP NOT NULL,
ALTER COLUMN "patient_name" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "profileType" DROP NOT NULL,
ALTER COLUMN "profile_path" DROP NOT NULL,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Service" ALTER COLUMN "assignedManager" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_assignedManager_fkey" FOREIGN KEY ("assignedManager") REFERENCES "manager"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
