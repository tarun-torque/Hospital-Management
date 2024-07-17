/*
  Warnings:

  - The `state` column on the `manager` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `country` column on the `manager` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `contact_number` on the `manager` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "manager" DROP COLUMN "state",
ADD COLUMN     "state" TEXT[],
DROP COLUMN "contact_number",
ADD COLUMN     "contact_number" BIGINT NOT NULL,
DROP COLUMN "country",
ADD COLUMN     "country" TEXT[];
