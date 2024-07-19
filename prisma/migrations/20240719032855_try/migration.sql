-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "managerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;
