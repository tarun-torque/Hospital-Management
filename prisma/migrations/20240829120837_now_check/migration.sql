-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "assignedManager" TEXT;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_assignedManager_fkey" FOREIGN KEY ("assignedManager") REFERENCES "manager"("username") ON DELETE SET NULL ON UPDATE CASCADE;
