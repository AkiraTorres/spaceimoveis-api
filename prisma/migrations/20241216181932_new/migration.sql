/*
  Warnings:

  - Added the required column `week_day` to the `available_times` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Week" AS ENUM ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');

-- AlterTable
ALTER TABLE "available_times" ADD COLUMN     "week_day" "Week" NOT NULL,
ALTER COLUMN "start" SET DATA TYPE TEXT,
ALTER COLUMN "end" SET DATA TYPE TEXT;
