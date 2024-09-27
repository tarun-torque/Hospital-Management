/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,startTime,endTime]` on the table `availableSlots` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "availableSlots_doctorId_startTime_endTime_key" ON "availableSlots"("doctorId", "startTime", "endTime");
