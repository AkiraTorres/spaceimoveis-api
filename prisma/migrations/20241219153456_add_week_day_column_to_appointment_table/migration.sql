/*
  Warnings:

  - Added the required column `week_day` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "week_day" "Week" NOT NULL;
