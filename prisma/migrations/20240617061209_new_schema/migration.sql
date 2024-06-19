-- CreateTable
CREATE TABLE "Creator" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country_code" INTEGER NOT NULL,
    "contact_number" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'noRole',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Yt_content" (
    "iframe" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "creatorid" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Article_content" (
    "id" SERIAL NOT NULL,
    "heading" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "creatorId" INTEGER,
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
    "creatorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT[],
    "yt_contentid" INTEGER,
    "article_contentId" INTEGER,
    "blog_contentId" INTEGER,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_username_key" ON "Creator"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Yt_content_creatorid_key" ON "Yt_content"("creatorid");

-- AddForeignKey
ALTER TABLE "Yt_content" ADD CONSTRAINT "Yt_content_creatorid_fkey" FOREIGN KEY ("creatorid") REFERENCES "Creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article_content" ADD CONSTRAINT "Article_content_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blog_content" ADD CONSTRAINT "Blog_content_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_yt_contentid_fkey" FOREIGN KEY ("yt_contentid") REFERENCES "Yt_content"("creatorid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_article_contentId_fkey" FOREIGN KEY ("article_contentId") REFERENCES "Article_content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_blog_contentId_fkey" FOREIGN KEY ("blog_contentId") REFERENCES "Blog_content"("id") ON DELETE SET NULL ON UPDATE CASCADE;
