/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Creator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Doctor" (
    "id" SERIAL NOT NULL,
    "profile_pic" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact_numbet" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "languages" TEXT[],
    "specialities" TEXT[],
    "experience" INTEGER NOT NULL,
    "maximum_education" TEXT NOT NULL,
    "documents" TEXT NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_email_key" ON "Creator"("email");
