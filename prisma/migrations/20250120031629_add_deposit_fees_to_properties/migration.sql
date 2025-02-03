-- AlterTable
ALTER TABLE `properties_prices` ADD COLUMN `deposit` INTEGER NULL,
    ADD COLUMN `deposit_installments` INTEGER NULL,
    ADD COLUMN `times_deposit` INTEGER NULL;
