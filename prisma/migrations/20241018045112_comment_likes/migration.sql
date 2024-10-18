-- CreateTable
CREATE TABLE "comments_likes" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "comments_likes_id_key" ON "comments_likes"("id");

-- AddForeignKey
ALTER TABLE "comments_likes" ADD CONSTRAINT "comments_likes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "posts_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments_likes" ADD CONSTRAINT "comments_likes_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;
