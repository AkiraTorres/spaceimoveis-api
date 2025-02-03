-- AlterTable
ALTER TABLE `users_infos` ADD COLUMN `highlight_limits` INTEGER NULL DEFAULT 1,
    ADD COLUMN `publish_limits` INTEGER NULL DEFAULT 3;
