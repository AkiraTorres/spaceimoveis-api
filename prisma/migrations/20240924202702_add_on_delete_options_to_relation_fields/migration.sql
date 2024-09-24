-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_user1Email_fkey";

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_user2Email_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_property_id_fkey";

-- DropForeignKey
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_user_email_fkey";

-- DropForeignKey
ALTER TABLE "followers" DROP CONSTRAINT "followers_followed_email_fkey";

-- DropForeignKey
ALTER TABLE "followers" DROP CONSTRAINT "followers_follower_email_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderEmail_fkey";

-- DropForeignKey
ALTER TABLE "properties" DROP CONSTRAINT "properties_advertiser_email_fkey";

-- DropForeignKey
ALTER TABLE "properties_addresses" DROP CONSTRAINT "properties_addresses_property_id_fkey";

-- DropForeignKey
ALTER TABLE "properties_comodities" DROP CONSTRAINT "properties_comodities_property_id_fkey";

-- DropForeignKey
ALTER TABLE "properties_prices" DROP CONSTRAINT "properties_prices_property_id_fkey";

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
ALTER TABLE "users_addresses" DROP CONSTRAINT "users_addresses_email_fkey";

-- DropForeignKey
ALTER TABLE "users_infos" DROP CONSTRAINT "users_infos_email_fkey";

-- DropForeignKey
ALTER TABLE "users_social" DROP CONSTRAINT "users_social_email_fkey";

-- AlterTable
ALTER TABLE "chats" ALTER COLUMN "user1Email" DROP NOT NULL,
ALTER COLUMN "user2Email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "senderEmail" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users_infos" ADD CONSTRAINT "users_infos_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_addresses" ADD CONSTRAINT "users_addresses_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_photos" ADD CONSTRAINT "user_photos_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_receiver_email_fkey" FOREIGN KEY ("receiver_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_ratings" ADD CONSTRAINT "user_ratings_sender_email_fkey" FOREIGN KEY ("sender_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_social" ADD CONSTRAINT "users_social_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_properties" ADD CONSTRAINT "shared_properties_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_properties" ADD CONSTRAINT "shared_properties_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user1Email_fkey" FOREIGN KEY ("user1Email") REFERENCES "users"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user2Email_fkey" FOREIGN KEY ("user2Email") REFERENCES "users"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_email_fkey" FOREIGN KEY ("follower_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_followed_email_fkey" FOREIGN KEY ("followed_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderEmail_fkey" FOREIGN KEY ("senderEmail") REFERENCES "users"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_advertiser_email_fkey" FOREIGN KEY ("advertiser_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties_prices" ADD CONSTRAINT "properties_prices_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties_addresses" ADD CONSTRAINT "properties_addresses_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties_comodities" ADD CONSTRAINT "properties_comodities_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_pictures" ADD CONSTRAINT "property_pictures_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reason_rejected_properties" ADD CONSTRAINT "reason_rejected_properties_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
