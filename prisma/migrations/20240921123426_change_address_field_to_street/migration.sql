/*
  Warnings:

  - You are about to drop the column `address` on the `properties_addresses` table. All the data in the column will be lost.
  - Added the required column `street` to the `properties_addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "properties_addresses" DROP COLUMN "address",
ADD COLUMN     "street" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "users_social" (
    "email" TEXT NOT NULL,
    "type" TEXT,
    "url" TEXT,

    CONSTRAINT "users_social_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_social_email_key" ON "users_social"("email");

-- AddForeignKey
ALTER TABLE "users_social" ADD CONSTRAINT "users_social_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
