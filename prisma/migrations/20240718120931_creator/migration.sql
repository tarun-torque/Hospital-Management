-- DropForeignKey
ALTER TABLE "Creator" DROP CONSTRAINT "Creator_managerId_fkey";

-- AlterTable
ALTER TABLE "Creator" ALTER COLUMN "managerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;
