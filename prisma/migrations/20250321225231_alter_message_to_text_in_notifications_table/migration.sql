/*
  Warnings:

  - You are about to drop the column `message` on the `notifications` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `notifications_sender_email_fkey` ON `notifications`;

-- DropIndex
DROP INDEX `notifications_user_email_fkey` ON `notifications`;

-- AlterTable
ALTER TABLE `notifications` DROP COLUMN `message`,
    ADD COLUMN `text` VARCHAR(191) NULL;
