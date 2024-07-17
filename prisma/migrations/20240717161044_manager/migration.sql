-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "managerId" INTEGER;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "managerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;
