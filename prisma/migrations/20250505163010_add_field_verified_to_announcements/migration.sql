-- AlterTable
ALTER TABLE `announcements` ADD COLUMN `verified` ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending';
