-- CreateTable
CREATE TABLE "continum" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "patientId" INTEGER NOT NULL,

    CONSTRAINT "continum_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "continum" ADD CONSTRAINT "continum_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
