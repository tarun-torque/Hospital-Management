/*
  Warnings:

  - You are about to drop the column `contact_numbet` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Doctor` table. All the data in the column will be lost.
  - Added the required column `contact_number` to the `Doctor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country_code` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Creator" ALTER COLUMN "country_code" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "contact_numbet",
DROP COLUMN "country",
ADD COLUMN     "contact_number" TEXT NOT NULL,
ADD COLUMN     "country_code" TEXT NOT NULL;
