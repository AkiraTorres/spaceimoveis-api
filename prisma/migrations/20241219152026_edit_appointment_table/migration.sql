/*
  Warnings:

  - Added the required column `advertiser_email` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "advertiser_email" TEXT NOT NULL;
