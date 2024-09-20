/*
  Warnings:

  - The `type` column on the `messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'video', 'audio', 'file');

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "type",
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'text';
