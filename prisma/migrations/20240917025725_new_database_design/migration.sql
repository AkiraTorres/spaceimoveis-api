-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('rent', 'sell', 'both');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('house', 'apartment', 'land', 'farm');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('client', 'owner', 'realtor', 'realstate', 'admin', 'property');

-- CreateEnum
CREATE TYPE "Furnished" AS ENUM ('yes', 'no', 'partial');

-- CreateEnum
CREATE TYPE "Verified" AS ENUM ('pending', 'verified', 'rejected');

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

    CONSTRAINT "users_infos_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "users_addresses" (
    "email" TEXT NOT NULL,
    "street" TEXT,
    "cep" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "neighborhood" TEXT,
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
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "user1Email" TEXT NOT NULL,
    "user2Email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "followers" (
    "id" TEXT NOT NULL,
    "follower_email" TEXT NOT NULL,
    "followed_email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderEmail" TEXT NOT NULL,
    "text" VARCHAR(16384) NOT NULL,
    "url" VARCHAR(2048),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "type" VARCHAR(25) NOT NULL DEFAULT 'text',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "type" "Type" NOT NULL DEFAULT 'property',
    "advertiser_email" TEXT NOT NULL,
    "announcement_type" "AnnouncementType" NOT NULL,
    "property_type" "PropertyType" NOT NULL,
    "is_highlight" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "floor" INTEGER,
    "size" INTEGER,
    "bathrooms" INTEGER,
    "bedrooms" INTEGER,
    "parking_spaces" INTEGER,
    "description" VARCHAR(1024) NOT NULL,
    "contact" TEXT NOT NULL,
    "financiable" BOOLEAN NOT NULL DEFAULT false,
    "negotiable" BOOLEAN NOT NULL DEFAULT false,
    "suites" INTEGER,
    "furnished" "Furnished",
    "verified" "Verified" NOT NULL DEFAULT 'pending',
    "times_seen" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
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
    "neighborhood" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "reason_rejecteds" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "reason_rejecteds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_messages" (
    "id" TEXT NOT NULL,
    "user_name" VARCHAR(25) NOT NULL,
    "user_email" VARCHAR(25) NOT NULL,
    "user_type" VARCHAR(25),
    "message" VARCHAR(4096) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_messages_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "chats_id_key" ON "chats"("id");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_id_key" ON "favorites"("id");

-- CreateIndex
CREATE UNIQUE INDEX "followers_id_key" ON "followers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_id_key" ON "messages"("id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_id_key" ON "properties"("id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_prices_property_id_key" ON "properties_prices"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_addresses_property_id_key" ON "properties_addresses"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_comodities_property_id_key" ON "properties_comodities"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_pictures_id_key" ON "property_pictures"("id");

-- CreateIndex
CREATE UNIQUE INDEX "reason_rejecteds_id_key" ON "reason_rejecteds"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_messages_id_key" ON "user_messages"("id");

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
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "reason_rejecteds" ADD CONSTRAINT "reason_rejecteds_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
