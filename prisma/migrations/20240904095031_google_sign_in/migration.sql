-- CreateTable
CREATE TABLE "patientGoogleSingIn" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "fcmToken" TEXT NOT NULL,

    CONSTRAINT "patientGoogleSingIn_pkey" PRIMARY KEY ("id")
);
