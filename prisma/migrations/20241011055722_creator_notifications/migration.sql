-- CreateTable
CREATE TABLE "creatorNotifications" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creatorNotifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "creatorNotifications" ADD CONSTRAINT "creatorNotifications_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
