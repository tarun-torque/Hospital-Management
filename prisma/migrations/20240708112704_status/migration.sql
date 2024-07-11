-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "remarks" TEXT DEFAULT 'I am active',
ADD COLUMN     "status" TEXT DEFAULT 'active';
