/*
  Warnings:

  - You are about to drop the `posts_media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `property_pictures` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reason_rejected_properties` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shared_properties` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_photos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_ratings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_social` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "posts_media" DROP CONSTRAINT "posts_media_postId_fkey";

-- DropForeignKey
ALTER TABLE "property_pictures" DROP CONSTRAINT "property_pictures_property_id_fkey";

-- DropForeignKey
ALTER TABLE "reason_rejected_properties" DROP CONSTRAINT "reason_rejected_properties_property_id_fkey";

-- DropForeignKey
ALTER TABLE "shared_properties" DROP CONSTRAINT "shared_properties_email_fkey";

-- DropForeignKey
ALTER TABLE "shared_properties" DROP CONSTRAINT "shared_properties_property_id_fkey";

-- DropForeignKey
ALTER TABLE "user_photos" DROP CONSTRAINT "user_photos_email_fkey";

-- DropForeignKey
ALTER TABLE "user_ratings" DROP CONSTRAINT "user_ratings_receiver_email_fkey";

-- DropForeignKey
ALTER TABLE "user_ratings" DROP CONSTRAINT "user_ratings_sender_email_fkey";

-- DropForeignKey
ALTER TABLE "users_posts" DROP CONSTRAINT "users_posts_email_fkey";

-- DropForeignKey
ALTER TABLE "users_social" DROP CONSTRAINT "users_social_email_fkey";

-- DropTable
DROP TABLE "posts_media";

-- DropTable
DROP TABLE "property_pictures";

-- DropTable
DROP TABLE "reason_rejected_properties";

-- DropTable
DROP TABLE "shared_properties";

-- DropTable
DROP TABLE "user_messages";

-- DropTable
DROP TABLE "user_photos";

-- DropTable
DROP TABLE "user_ratings";

-- DropTable
DROP TABLE "users_posts";

-- DropTable
DROP TABLE "users_social";

-- CreateTable
CREATE TABLE "users_photos" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_ratings" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "receiver_email" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_socials" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT,
    "url" TEXT,

    CONSTRAINT "users_socials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "text" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts_medias" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties_shared" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "properties_shared_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties_pictures" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "properties_pictures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties_rejected_reason" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "properties_rejected_reason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_messages" (
    "id" TEXT NOT NULL,
    "user_name" VARCHAR(25) NOT NULL,
    "user_email" VARCHAR(25) NOT NULL,
    "user_type" VARCHAR(25),
    "message" VARCHAR(4096) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_photos_id_key" ON "users_photos"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_photos_email_key" ON "users_photos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_ratings_id_key" ON "users_ratings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_socials_id_key" ON "users_socials"("id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_id_key" ON "posts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_medias_id_key" ON "posts_medias"("id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_shared_id_key" ON "properties_shared"("id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_pictures_id_key" ON "properties_pictures"("id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_rejected_reason_id_key" ON "properties_rejected_reason"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_messages_id_key" ON "users_messages"("id");

-- AddForeignKey
ALTER TABLE "users_photos" ADD CONSTRAINT "users_photos_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_ratings" ADD CONSTRAINT "users_ratings_receiver_email_fkey" FOREIGN KEY ("receiver_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_ratings" ADD CONSTRAINT "users_ratings_sender_email_fkey" FOREIGN KEY ("sender_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_socials" ADD CONSTRAINT "users_socials_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts_medias" ADD CONSTRAINT "posts_medias_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties_shared" ADD CONSTRAINT "properties_shared_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties_shared" ADD CONSTRAINT "properties_shared_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties_pictures" ADD CONSTRAINT "properties_pictures_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties_rejected_reason" ADD CONSTRAINT "properties_rejected_reason_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
