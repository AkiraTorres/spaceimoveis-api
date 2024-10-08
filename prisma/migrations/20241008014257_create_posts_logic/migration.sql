-- CreateTable
CREATE TABLE "users_posts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "text" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts_media" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_posts_id_key" ON "users_posts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_media_id_key" ON "posts_media"("id");

-- AddForeignKey
ALTER TABLE "users_posts" ADD CONSTRAINT "users_posts_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts_media" ADD CONSTRAINT "posts_media_postId_fkey" FOREIGN KEY ("postId") REFERENCES "users_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
