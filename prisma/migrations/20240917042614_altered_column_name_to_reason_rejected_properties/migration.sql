/*
  Warnings:

  - You are about to drop the `reason_rejecteds` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "reason_rejecteds" DROP CONSTRAINT "reason_rejecteds_property_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "reason_rejecteds";

-- CreateTable
CREATE TABLE "reason_rejected_properties" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "reason_rejected_properties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reason_rejected_properties_id_key" ON "reason_rejected_properties"("id");

-- AddForeignKey
ALTER TABLE "reason_rejected_properties" ADD CONSTRAINT "reason_rejected_properties_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
