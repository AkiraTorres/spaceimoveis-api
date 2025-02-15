/*
  Warnings:

  - Added the required column `payment_status` to the `announcements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `announcements` ADD COLUMN `payment_status` VARCHAR(191) NOT NULL;
