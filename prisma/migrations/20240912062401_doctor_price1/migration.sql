-- CreateTable
CREATE TABLE "DoctorPrice" (
    "id" SERIAL NOT NULL,
    "yourPrice" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "doctorId" INTEGER NOT NULL,

    CONSTRAINT "DoctorPrice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DoctorPrice" ADD CONSTRAINT "DoctorPrice_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorPrice" ADD CONSTRAINT "DoctorPrice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
