-- AlterTable
ALTER TABLE "Article_content" ADD COLUMN     "verified" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Blog_content" ADD COLUMN     "verified" TEXT NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Yt_content" ADD COLUMN     "verified" TEXT NOT NULL DEFAULT 'pending';
