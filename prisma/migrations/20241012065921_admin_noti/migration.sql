-- CreateTable
CREATE TABLE "adminNotifications" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "adminId" INTEGER NOT NULL,

    CONSTRAINT "adminNotifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "adminNotifications" ADD CONSTRAINT "adminNotifications_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
