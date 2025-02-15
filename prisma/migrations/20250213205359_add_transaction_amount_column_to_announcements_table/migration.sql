/*
  Warnings:

  - Added the required column `transaction_amount` to the `announcements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `announcements` ADD COLUMN `transaction_amount` DOUBLE NOT NULL;
