/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,serviceId]` on the table `DoctorPrice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DoctorPrice_doctorId_serviceId_key" ON "DoctorPrice"("doctorId", "serviceId");
