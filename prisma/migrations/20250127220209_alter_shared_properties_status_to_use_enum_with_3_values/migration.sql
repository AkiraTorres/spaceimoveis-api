/*
  Warnings:

  - You are about to drop the column `accepted` on the `properties_shared` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `properties_shared` DROP COLUMN `accepted`,
    ADD COLUMN `status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending';
