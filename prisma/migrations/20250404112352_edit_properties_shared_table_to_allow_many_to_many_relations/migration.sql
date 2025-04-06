/*
  Warnings:

  - The primary key for the `properties_shared` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `properties_shared` table. All the data in the column will be lost.
  - You are about to drop the column `property_id` on the `properties_shared` table. All the data in the column will be lost.
  - Added the required column `propertyId` to the `properties_shared` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `properties_shared` DROP FOREIGN KEY `properties_shared_property_id_fkey`;

-- DropIndex
DROP INDEX `properties_shared_id_key` ON `properties_shared`;

-- AlterTable
ALTER TABLE `properties_shared` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `property_id`,
    ADD COLUMN `propertyId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`propertyId`, `email`);

-- AddForeignKey
ALTER TABLE `properties_shared` ADD CONSTRAINT `properties_shared_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
