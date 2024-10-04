-- CreateTable
CREATE TABLE "doctorNotification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "doctorId" INTEGER NOT NULL,

    CONSTRAINT "doctorNotification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "doctorNotification" ADD CONSTRAINT "doctorNotification_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
