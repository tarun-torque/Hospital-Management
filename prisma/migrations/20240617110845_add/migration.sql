-- AlterTable
ALTER TABLE "Yt_content" ADD COLUMN     "category" TEXT[];

-- CreateTable
CREATE TABLE "Article_content" (
    "id" SERIAL NOT NULL,
    "heading" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "category" TEXT[],
    "article_creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog_content" (
    "id" SERIAL NOT NULL,
    "heading" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "category" TEXT[],
    "blog_creatorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_content_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Article_content" ADD CONSTRAINT "Article_content_article_creatorId_fkey" FOREIGN KEY ("article_creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog_content" ADD CONSTRAINT "Blog_content_blog_creatorId_fkey" FOREIGN KEY ("blog_creatorId") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
