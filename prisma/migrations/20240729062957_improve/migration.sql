-- DropForeignKey
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_assignedManager_fkey";

-- AlterTable
ALTER TABLE "Doctor" ALTER COLUMN "assignedManager" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_assignedManager_fkey" FOREIGN KEY ("assignedManager") REFERENCES "manager"("username") ON DELETE SET NULL ON UPDATE CASCADE;
