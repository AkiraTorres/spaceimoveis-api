/*
  Warnings:

  - You are about to drop the column `week_day` on the `appointments` table. All the data in the column will be lost.
  - Changed the type of `start` on the `available_times` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `end` on the `available_times` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "week_day";

-- AlterTable
ALTER TABLE "available_times" DROP COLUMN "start",
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL,
DROP COLUMN "end",
ADD COLUMN     "end" TIMESTAMP(3) NOT NULL;
