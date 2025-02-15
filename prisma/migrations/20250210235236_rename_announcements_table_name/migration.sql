/*
  Warnings:

  - You are about to drop the `Announcement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Announcement`;

-- CreateTable
CREATE TABLE `announcements` (
    `id` VARCHAR(191) NOT NULL,
    `announcer_name` VARCHAR(191) NOT NULL,
    `announcer_email` VARCHAR(191) NOT NULL,
    `announcer_cpf` VARCHAR(191) NOT NULL,
    `photo_url` VARCHAR(191) NOT NULL,
    `site_url` VARCHAR(191) NOT NULL,
    `payment_type` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,
    `valid_until` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `announcements_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
