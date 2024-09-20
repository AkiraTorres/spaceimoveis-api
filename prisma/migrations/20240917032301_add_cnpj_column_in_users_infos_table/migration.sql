/*
  Warnings:

  - A unique constraint covering the columns `[cpnj]` on the table `users_infos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users_infos" ADD COLUMN     "cpnj" VARCHAR(15),
ALTER COLUMN "cpf" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_infos_cpnj_key" ON "users_infos"("cpnj");
