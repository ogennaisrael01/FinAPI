-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Test_id_key" ON "Test"("id");
