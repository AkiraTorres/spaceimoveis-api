-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `chat_id` VARCHAR(191) NULL,
    ADD COLUMN `shared_property_id` VARCHAR(191) NULL;
