-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "remarks" TEXT NOT NULL DEFAULT 'no remarks',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ALTER COLUMN "managerId" SET DEFAULT 0;
