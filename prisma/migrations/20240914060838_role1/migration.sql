-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "role" TEXT DEFAULT 'creator';

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "role" TEXT DEFAULT 'doctor';

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "role" TEXT DEFAULT 'patient';

-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "role" TEXT DEFAULT 'admin';

-- AlterTable
ALTER TABLE "manager" ADD COLUMN     "role" TEXT DEFAULT 'manager';
