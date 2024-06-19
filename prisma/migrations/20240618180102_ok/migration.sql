/*
  Warnings:

  - Added the required column `blogImagePath` to the `Blog_content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blogImageType` to the `Blog_content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Creator` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blog_content" ADD COLUMN     "blogImagePath" TEXT NOT NULL,
ADD COLUMN     "blogImageType" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "language" TEXT[],
ADD COLUMN     "state" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country_code" TEXT[],
    "contact_number" INTEGER NOT NULL,
    "dob" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "new_patient" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Support" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Support_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mood" (
    "int" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "your_mood_today" TEXT NOT NULL,
    "note" TEXT NOT NULL,

    CONSTRAINT "Mood_pkey" PRIMARY KEY ("int")
);

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mood" ADD CONSTRAINT "Mood_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
