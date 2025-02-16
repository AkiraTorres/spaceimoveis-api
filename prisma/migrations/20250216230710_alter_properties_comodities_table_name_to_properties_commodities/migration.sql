/*
  Warnings:

  - You are about to drop the `properties_comodities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `properties_comodities` DROP FOREIGN KEY `properties_comodities_property_id_fkey`;

-- DropTable
DROP TABLE `properties_comodities`;

-- CreateTable
CREATE TABLE `properties_commodities` (
    `property_id` VARCHAR(191) NOT NULL,
    `pool` BOOLEAN NOT NULL DEFAULT false,
    `grill` BOOLEAN NOT NULL DEFAULT false,
    `air_conditioning` BOOLEAN NOT NULL DEFAULT false,
    `playground` BOOLEAN NOT NULL DEFAULT false,
    `event_area` BOOLEAN NOT NULL DEFAULT false,
    `gourmet_area` BOOLEAN NOT NULL DEFAULT false,
    `garden` BOOLEAN NOT NULL DEFAULT false,
    `porch` BOOLEAN NOT NULL DEFAULT false,
    `slab` BOOLEAN NOT NULL DEFAULT false,
    `gated_community` BOOLEAN NOT NULL DEFAULT false,
    `gym` BOOLEAN NOT NULL DEFAULT false,
    `balcony` BOOLEAN NOT NULL DEFAULT false,
    `solar_energy` BOOLEAN NOT NULL DEFAULT false,
    `concierge` BOOLEAN NOT NULL DEFAULT false,
    `yard` BOOLEAN NOT NULL DEFAULT false,
    `elevator` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `properties_commodities_property_id_key`(`property_id`),
    PRIMARY KEY (`property_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `properties_commodities` ADD CONSTRAINT `properties_commodities_property_id_fkey` FOREIGN KEY (`property_id`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
