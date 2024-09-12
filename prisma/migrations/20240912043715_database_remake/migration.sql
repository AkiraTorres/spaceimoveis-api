/*
  Warnings:

  - You are about to drop the column `user1` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `user2` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `client_email` on the `favorites` table. All the data in the column will be lost.
  - You are about to drop the column `owner_email` on the `favorites` table. All the data in the column will be lost.
  - You are about to drop the column `realstate_email` on the `favorites` table. All the data in the column will be lost.
  - You are about to drop the column `realtor_email` on the `favorites` table. All the data in the column will be lost.
  - You are about to drop the column `sender` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `aditional_fees` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `air_conditioner` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `balcony` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `cep` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `complement` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `concierge` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `event_area` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `garden` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `gated_community` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `gourmet_area` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `grill` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `gym` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `house_number` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `iptu` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `owner_email` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `playground` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `pool` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `porch` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `realstate_email` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `realtor_email` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `rent_price` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `sell_price` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `slab` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `solar_energy` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `properties` table. All the data in the column will be lost.
  - You are about to drop the column `yard` on the `properties` table. All the data in the column will be lost.
  - The `type` column on the `properties` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `floor` column on the `properties` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `admin_photos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `client_photos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clients` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `message_files` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `owner_photos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `owners` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `photos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `realstate_photos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `realstate_ratings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `realstates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `realtor_photos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `realtor_ratings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `realtors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `share_to_realstates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `share_to_realtors` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user1Email` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2Email` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_email` to the `favorites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderEmail` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `advertiser_email` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `announcement_type` on the `properties` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `property_type` on the `properties` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('rent', 'sell', 'both');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('house', 'apartment', 'land', 'farm');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('client', 'owner', 'realtor', 'realstate', 'admin', 'property');

-- DropForeignKey
ALTER TABLE "admin_photos" DROP CONSTRAINT "admin_photos_email_fkey";

-- DropForeignKey
ALTER TABLE "client_photos" DROP CONSTRAINT "client_photos_email_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_client_email_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_owner_email_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_realstate_email_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_realtor_email_fkey";

-- DropForeignKey
ALTER TABLE "message_files" DROP CONSTRAINT "message_files_chatId_fkey";

-- DropForeignKey
ALTER TABLE "owner_photos" DROP CONSTRAINT "owner_photos_email_fkey";

-- DropForeignKey
ALTER TABLE "photos" DROP CONSTRAINT "photos_property_id_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_owner_email_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_realstate_email_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_realtor_email_fkey";

-- DropForeignKey
ALTER TABLE "realstate_photos" DROP CONSTRAINT "realstate_photos_email_fkey";

-- DropForeignKey
ALTER TABLE "realstate_ratings" DROP CONSTRAINT "realstate_ratings_receiver_email_fkey";

-- DropForeignKey
ALTER TABLE "realtor_photos" DROP CONSTRAINT "realtor_photos_email_fkey";

-- DropForeignKey
ALTER TABLE "realtor_ratings" DROP CONSTRAINT "realtor_ratings_receiver_email_fkey";

-- DropForeignKey
ALTER TABLE "share_to_realstates" DROP CONSTRAINT "share_to_realstates_email_fkey";

-- DropForeignKey
ALTER TABLE "share_to_realstates" DROP CONSTRAINT "share_to_realstates_property_id_fkey";

-- DropForeignKey
ALTER TABLE "share_to_realtors" DROP CONSTRAINT "share_to_realtors_email_fkey";

-- DropForeignKey
ALTER TABLE "share_to_realtors" DROP CONSTRAINT "share_to_realtors_property_id_fkey";

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "user1",
DROP COLUMN "user2",
ADD COLUMN     "user1Email" TEXT NOT NULL,
ADD COLUMN     "user2Email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "favorites" DROP COLUMN "client_email",
DROP COLUMN "owner_email",
DROP COLUMN "realstate_email",
DROP COLUMN "realtor_email",
ADD COLUMN     "user_email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "sender",
ADD COLUMN     "senderEmail" TEXT NOT NULL,
ADD COLUMN     "url" VARCHAR(2048);

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "address",
DROP COLUMN "aditional_fees",
DROP COLUMN "air_conditioner",
DROP COLUMN "balcony",
DROP COLUMN "cep",
DROP COLUMN "city",
DROP COLUMN "complement",
DROP COLUMN "concierge",
DROP COLUMN "district",
DROP COLUMN "event_area",
DROP COLUMN "garden",
DROP COLUMN "gated_community",
DROP COLUMN "gourmet_area",
DROP COLUMN "grill",
DROP COLUMN "gym",
DROP COLUMN "house_number",
DROP COLUMN "iptu",
DROP COLUMN "owner_email",
DROP COLUMN "playground",
DROP COLUMN "pool",
DROP COLUMN "porch",
DROP COLUMN "realstate_email",
DROP COLUMN "realtor_email",
DROP COLUMN "rent_price",
DROP COLUMN "sell_price",
DROP COLUMN "slab",
DROP COLUMN "solar_energy",
DROP COLUMN "state",
DROP COLUMN "yard",
ADD COLUMN     "advertiser_email" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "Type" NOT NULL DEFAULT 'property',
DROP COLUMN "announcement_type",
ADD COLUMN     "announcement_type" "AnnouncementType" NOT NULL,
DROP COLUMN "property_type",
ADD COLUMN     "property_type" "PropertyType" NOT NULL,
DROP COLUMN "floor",
ADD COLUMN     "floor" INTEGER,
ALTER COLUMN "furnished" DROP DEFAULT;

-- DropTable
DROP TABLE "admin_photos";

-- DropTable
DROP TABLE "admins";

-- DropTable
DROP TABLE "client_photos";

-- DropTable
DROP TABLE "clients";

-- DropTable
DROP TABLE "message_files";

-- DropTable
DROP TABLE "owner_photos";

-- DropTable
DROP TABLE "owners";

-- DropTable
DROP TABLE "photos";

-- DropTable
DROP TABLE "realstate_photos";

-- DropTable
DROP TABLE "realstate_ratings";

-- DropTable
DROP TABLE "realstates";

-- DropTable
DROP TABLE "realtor_photos";

-- DropTable
DROP TABLE "realtor_ratings";

-- DropTable
DROP TABLE "realtors";

-- DropTable
DROP TABLE "share_to_realstates";

-- DropTable
DROP TABLE "share_to_realtors";

-- CreateTable
CREATE TABLE "users" (
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handler" VARCHAR(16) NOT NULL,
    "password" TEXT NOT NULL,
    "type" "Type" NOT NULL DEFAULT 'client',
    "otp" VARCHAR(6),
    "otp_ttl" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "users_infos" (
    "email" TEXT NOT NULL,
    "cpf" VARCHAR(11) NOT NULL,
    "rg" TEXT,
    "creci" TEXT,
    "phone" VARCHAR(25),
    "id_phone" TEXT,
    "bio" VARCHAR(1024),
    "subscription" TEXT DEFAULT 'free',
    "photoUrl" TEXT,
    "photoName" TEXT,
    "photoType" TEXT,

    CONSTRAINT "users_infos_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "users_addresses" (
    "email" TEXT NOT NULL,
    "address" TEXT,
    "house_number" TEXT,
    "cep" TEXT,
    "district" TEXT,
    "city" TEXT,
    "state" VARCHAR(2),

    CONSTRAINT "users_addresses_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "user_photos" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_ratings" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "receiver_email" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_properties" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties_prices" (
    "property_id" TEXT NOT NULL,
    "rent_price" INTEGER,
    "sell_price" INTEGER,
    "iptu" INTEGER,
    "aditional_fees" INTEGER,

    CONSTRAINT "properties_prices_pkey" PRIMARY KEY ("property_id")
);

-- CreateTable
CREATE TABLE "properties_addresses" (
    "property_id" TEXT NOT NULL,
    "cep" VARCHAR(9) NOT NULL,
    "address" TEXT NOT NULL,
    "house_number" TEXT,
    "city" TEXT NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "district" TEXT NOT NULL,
    "complement" TEXT,

    CONSTRAINT "properties_addresses_pkey" PRIMARY KEY ("property_id")
);

-- CreateTable
CREATE TABLE "properties_comodities" (
    "property_id" TEXT NOT NULL,
    "pool" BOOLEAN NOT NULL DEFAULT false,
    "grill" BOOLEAN NOT NULL DEFAULT false,
    "air_conditioner" BOOLEAN NOT NULL DEFAULT false,
    "playground" BOOLEAN NOT NULL DEFAULT false,
    "event_area" BOOLEAN NOT NULL DEFAULT false,
    "gourmet_area" BOOLEAN NOT NULL DEFAULT false,
    "garden" BOOLEAN NOT NULL DEFAULT false,
    "porch" BOOLEAN NOT NULL DEFAULT false,
    "slab" BOOLEAN NOT NULL DEFAULT false,
    "gated_community" BOOLEAN NOT NULL DEFAULT false,
    "gym" BOOLEAN NOT NULL DEFAULT false,
    "balcony" BOOLEAN NOT NULL DEFAULT false,
    "solar_energy" BOOLEAN NOT NULL DEFAULT false,
    "concierge" BOOLEAN NOT NULL DEFAULT false,
    "yard" BOOLEAN NOT NULL DEFAULT false,
    "elevator" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "properties_comodities_pkey" PRIMARY KEY ("property_id")
);

-- CreateTable
CREATE TABLE "property_pictures" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_pictures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_handler_key" ON "users"("handler");

-- CreateIndex
CREATE UNIQUE INDEX "users_infos_email_key" ON "users_infos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_infos_cpf_key" ON "users_infos"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "users_infos_rg_key" ON "users_infos"("rg");

-- CreateIndex
CREATE UNIQUE INDEX "users_infos_creci_key" ON "users_infos"("creci");

-- CreateIndex
CREATE UNIQUE INDEX "users_addresses_email_key" ON "users_addresses"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_photos_id_key" ON "user_photos"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_photos_email_key" ON "user_photos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_ratings_id_key" ON "user_ratings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "shared_properties_id_key" ON "shared_properties"("id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_prices_property_id_key" ON "properties_prices"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_addresses_property_id_key" ON "properties_addresses"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_comodities_property_id_key" ON "properties_comodities"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_pictures_id_key" ON "property_pictures"("id");

-- AddForeignKey
ALTER TABLE "users_infos" ADD CONSTRAINT "users_infos_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_addresses" ADD CONSTRAINT "users_addresses_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_photos" ADD CONSTRAINT "user_photos_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_receiver_email_fkey" FOREIGN KEY ("receiver_email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_sender_email_fkey" FOREIGN KEY ("sender_email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_properties" ADD CONSTRAINT "shared_properties_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_properties" ADD CONSTRAINT "shared_properties_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user1Email_fkey" FOREIGN KEY ("user1Email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user2Email_fkey" FOREIGN KEY ("user2Email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_email_fkey" FOREIGN KEY ("follower_email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_followed_email_fkey" FOREIGN KEY ("followed_email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderEmail_fkey" FOREIGN KEY ("senderEmail") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_advertiser_email_fkey" FOREIGN KEY ("advertiser_email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties_prices" ADD CONSTRAINT "properties_prices_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties_addresses" ADD CONSTRAINT "properties_addresses_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties_comodities" ADD CONSTRAINT "properties_comodities_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_pictures" ADD CONSTRAINT "property_pictures_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
