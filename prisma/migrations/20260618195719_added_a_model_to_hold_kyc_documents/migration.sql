-- CreateTable
CREATE TABLE "KycDocuments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bvnEncrypted" TEXT,
    "ninEncrypted" TEXT,
    "idType" TEXT,
    "idDocURL" TEXT,
    "bvnVerifiedAt" TIMESTAMP(3),
    "ninVerifiedAt" TIMESTAMP(3),
    "idVerifiedAt" TIMESTAMP(3),
    "rejectionCount" INTEGER NOT NULL DEFAULT 0,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KycDocuments_userId_key" ON "KycDocuments"("userId");

-- CreateIndex
CREATE INDEX "KycDocuments_userId_idx" ON "KycDocuments"("userId");

-- CreateIndex
CREATE INDEX "KycDocuments_id_idx" ON "KycDocuments"("id");

-- CreateIndex
CREATE INDEX "KycDocuments_createdAt_idx" ON "KycDocuments"("createdAt");

-- CreateIndex
CREATE INDEX "BlacklistedToken_tokenId_idx" ON "BlacklistedToken"("tokenId");

-- CreateIndex
CREATE INDEX "OutstandingToken_jti_idx" ON "OutstandingToken"("jti");

-- CreateIndex
CREATE INDEX "OutstandingToken_expiresAt_idx" ON "OutstandingToken"("expiresAt");

-- CreateIndex
CREATE INDEX "OutstandingToken_userId_idx" ON "OutstandingToken"("userId");

-- AddForeignKey
ALTER TABLE "KycDocuments" ADD CONSTRAINT "KycDocuments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
