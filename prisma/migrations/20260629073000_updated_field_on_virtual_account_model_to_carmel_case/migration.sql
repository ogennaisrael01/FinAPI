/*
  Warnings:

  - You are about to drop the column `account_name` on the `VirtualAccounts` table. All the data in the column will be lost.
  - You are about to drop the column `account_number` on the `VirtualAccounts` table. All the data in the column will be lost.
  - You are about to drop the column `bank_code` on the `VirtualAccounts` table. All the data in the column will be lost.
  - You are about to drop the column `bank_name` on the `VirtualAccounts` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `VirtualAccounts` table. All the data in the column will be lost.
  - You are about to drop the column `monnify_ref` on the `VirtualAccounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountNumber]` on the table `VirtualAccounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[monnifyRef]` on the table `VirtualAccounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountName` to the `VirtualAccounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountNumber` to the `VirtualAccounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankCode` to the `VirtualAccounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "VirtualAccounts_account_number_bank_code_idx";

-- DropIndex
DROP INDEX "VirtualAccounts_account_number_key";

-- DropIndex
DROP INDEX "VirtualAccounts_is_active_idx";

-- DropIndex
DROP INDEX "VirtualAccounts_monnify_ref_idx";

-- DropIndex
DROP INDEX "VirtualAccounts_monnify_ref_key";

-- AlterTable
ALTER TABLE "VirtualAccounts" DROP COLUMN "account_name",
DROP COLUMN "account_number",
DROP COLUMN "bank_code",
DROP COLUMN "bank_name",
DROP COLUMN "is_active",
DROP COLUMN "monnify_ref",
ADD COLUMN     "accountName" TEXT NOT NULL,
ADD COLUMN     "accountNumber" TEXT NOT NULL,
ADD COLUMN     "bankCode" TEXT NOT NULL,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "monnifyRef" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "VirtualAccounts_accountNumber_key" ON "VirtualAccounts"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualAccounts_monnifyRef_key" ON "VirtualAccounts"("monnifyRef");

-- CreateIndex
CREATE INDEX "VirtualAccounts_accountNumber_bankCode_idx" ON "VirtualAccounts"("accountNumber", "bankCode");

-- CreateIndex
CREATE INDEX "VirtualAccounts_monnifyRef_idx" ON "VirtualAccounts"("monnifyRef");

-- CreateIndex
CREATE INDEX "VirtualAccounts_isActive_idx" ON "VirtualAccounts"("isActive");
