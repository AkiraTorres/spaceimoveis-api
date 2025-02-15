/*
  Warnings:

  - You are about to alter the column `payment_id` on the `announcements` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `announcements` MODIFY `payment_id` INTEGER NOT NULL;
