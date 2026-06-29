-- CreateTable
CREATE TABLE "VirtualAccounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "bank_name" TEXT,
    "bank_code" TEXT NOT NULL,
    "monnify_ref" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VirtualAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "lockedBalance" INTEGER NOT NULL DEFAULT 0,
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VirtualAccounts_userId_key" ON "VirtualAccounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualAccounts_account_number_key" ON "VirtualAccounts"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualAccounts_monnify_ref_key" ON "VirtualAccounts"("monnify_ref");

-- CreateIndex
CREATE INDEX "VirtualAccounts_userId_idx" ON "VirtualAccounts"("userId");

-- CreateIndex
CREATE INDEX "VirtualAccounts_account_number_bank_code_idx" ON "VirtualAccounts"("account_number", "bank_code");

-- CreateIndex
CREATE INDEX "VirtualAccounts_monnify_ref_idx" ON "VirtualAccounts"("monnify_ref");

-- CreateIndex
CREATE INDEX "VirtualAccounts_is_active_idx" ON "VirtualAccounts"("is_active");

-- CreateIndex
CREATE INDEX "VirtualAccounts_createdAt_idx" ON "VirtualAccounts"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_id_key" ON "Wallet"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- AddForeignKey
ALTER TABLE "VirtualAccounts" ADD CONSTRAINT "VirtualAccounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
