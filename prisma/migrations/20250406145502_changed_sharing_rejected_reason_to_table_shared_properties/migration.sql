/*
  Warnings:

  - You are about to drop the column `sharing_rejected` on the `properties_rejected_reason` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `properties_rejected_reason` DROP COLUMN `sharing_rejected`;

-- AlterTable
ALTER TABLE `properties_shared` ADD COLUMN `reason_rejected` VARCHAR(191) NULL;
