/*
  Warnings:

  - You are about to drop the column `priority` on the `Diagnostic` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Diagnostic` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Diagnostic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Diagnostic" DROP COLUMN "priority",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "gnvLeakTest" BOOLEAN DEFAULT false,
ADD COLUMN     "gnvPressure" DOUBLE PRECISION,
ADD COLUMN     "gnvSolenoid" TEXT,
ALTER COLUMN "technicalNotes" DROP NOT NULL;
