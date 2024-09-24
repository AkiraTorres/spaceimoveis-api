/*
  Warnings:

  - You are about to drop the column `air_conditioner` on the `properties_comodities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "properties_comodities" DROP COLUMN "air_conditioner",
ADD COLUMN     "air_conditioning" BOOLEAN NOT NULL DEFAULT false;
