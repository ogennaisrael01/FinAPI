-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "pinHash" TEXT,
    "kycTier" INTEGER NOT NULL DEFAULT 0,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "bvnVerified" BOOLEAN NOT NULL DEFAULT false,
    "ninVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "flwCustomerId" TEXT,
    "profilePhotoUrl" JSONB DEFAULT '{}',
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "address" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCodes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpCodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_flwCustomerId_idx" ON "User"("flwCustomerId");

-- CreateIndex
CREATE INDEX "User_kycTier_idx" ON "User"("kycTier");

-- CreateIndex
CREATE INDEX "User_phoneVerified_idx" ON "User"("phoneVerified");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_bvnVerified_idx" ON "User"("bvnVerified");

-- CreateIndex
CREATE INDEX "User_ninVerified_idx" ON "User"("ninVerified");

-- CreateIndex
CREATE INDEX "User_isFrozen_idx" ON "User"("isFrozen");

-- CreateIndex
CREATE UNIQUE INDEX "OtpCodes_id_key" ON "OtpCodes"("id");

-- CreateIndex
CREATE INDEX "OtpCodes_userId_idx" ON "OtpCodes"("userId");

-- CreateIndex
CREATE INDEX "OtpCodes_type_idx" ON "OtpCodes"("type");

-- CreateIndex
CREATE INDEX "OtpCodes_createdAt_idx" ON "OtpCodes"("createdAt");

-- CreateIndex
CREATE INDEX "OtpCodes_expiresAt_idx" ON "OtpCodes"("expiresAt");

-- CreateIndex
CREATE INDEX "OtpCodes_isUsed_idx" ON "OtpCodes"("isUsed");

-- CreateIndex
CREATE INDEX "OtpCodes_attempts_idx" ON "OtpCodes"("attempts");

-- CreateIndex
CREATE INDEX "OtpCodes_usedAt_idx" ON "OtpCodes"("usedAt");

-- CreateIndex
CREATE INDEX "OtpCodes_otpHash_idx" ON "OtpCodes"("otpHash");

-- AddForeignKey
ALTER TABLE "OtpCodes" ADD CONSTRAINT "OtpCodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
