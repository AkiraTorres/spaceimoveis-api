/*
  Warnings:

  - You are about to drop the column `house_number` on the `properties_addresses` table. All the data in the column will be lost.
  - Made the column `floor` on table `properties` required. This step will fail if there are existing NULL values in that column.
  - Made the column `size` on table `properties` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bathrooms` on table `properties` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bedrooms` on table `properties` required. This step will fail if there are existing NULL values in that column.
  - Made the column `parking_spaces` on table `properties` required. This step will fail if there are existing NULL values in that column.
  - Made the column `suites` on table `properties` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "properties" ALTER COLUMN "floor" SET NOT NULL,
ALTER COLUMN "floor" SET DEFAULT 1,
ALTER COLUMN "size" SET NOT NULL,
ALTER COLUMN "bathrooms" SET NOT NULL,
ALTER COLUMN "bathrooms" SET DEFAULT 0,
ALTER COLUMN "bedrooms" SET NOT NULL,
ALTER COLUMN "bedrooms" SET DEFAULT 0,
ALTER COLUMN "parking_spaces" SET NOT NULL,
ALTER COLUMN "parking_spaces" SET DEFAULT 0,
ALTER COLUMN "suites" SET NOT NULL,
ALTER COLUMN "suites" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "properties_addresses" DROP COLUMN "house_number",
ADD COLUMN     "number" TEXT;
