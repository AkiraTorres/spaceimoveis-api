/*
  Warnings:

  - The primary key for the `users_social` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `users_social` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `users_social` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "users_social_email_key";

-- AlterTable
ALTER TABLE "users_social" DROP CONSTRAINT "users_social_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "users_social_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_social_id_key" ON "users_social"("id");
