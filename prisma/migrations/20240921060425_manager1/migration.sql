-- CreateTable
CREATE TABLE "managerNotification" (
    "id" SERIAL NOT NULL,
    "isRead" TEXT NOT NULL DEFAULT 'no',
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "managerId" INTEGER NOT NULL,

    CONSTRAINT "managerNotification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "managerNotification" ADD CONSTRAINT "managerNotification_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "manager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
