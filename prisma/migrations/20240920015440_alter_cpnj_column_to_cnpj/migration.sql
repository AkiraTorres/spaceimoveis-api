/*
  Warnings:

  - You are about to drop the column `cpnj` on the `users_infos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cnpj]` on the table `users_infos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_infos_cpnj_key";

-- AlterTable
ALTER TABLE "users_infos" DROP COLUMN "cpnj",
ADD COLUMN     "cnpj" VARCHAR(15);

-- CreateIndex
CREATE UNIQUE INDEX "users_infos_cnpj_key" ON "users_infos"("cnpj");
