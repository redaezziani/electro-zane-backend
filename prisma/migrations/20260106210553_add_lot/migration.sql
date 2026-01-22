-- CreateEnum
CREATE TYPE "public"."LotStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'ARRIVED', 'VERIFIED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ArrivalStatus" AS ENUM ('PENDING', 'VERIFIED', 'DAMAGED', 'INCOMPLETE', 'EXCESS');

-- CreateTable
CREATE TABLE "public"."Lot" (
    "id" TEXT NOT NULL,
    "lotId" SERIAL NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "totalQuantity" INTEGER NOT NULL,
    "companyName" VARCHAR(200) NOT NULL,
    "companyCity" VARCHAR(100) NOT NULL,
    "status" "public"."LotStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LotDetail" (
    "id" TEXT NOT NULL,
    "detailId" SERIAL NOT NULL,
    "lotId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "shippingCompany" VARCHAR(200) NOT NULL,
    "shippingCompanyCity" VARCHAR(100) NOT NULL,
    "pieceDetails" JSONB NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LotDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LotArrival" (
    "id" TEXT NOT NULL,
    "arrivalId" SERIAL NOT NULL,
    "lotId" TEXT NOT NULL,
    "lotDetailId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "shippingCompany" VARCHAR(200) NOT NULL,
    "shippingCompanyCity" VARCHAR(100) NOT NULL,
    "pieceDetails" JSONB NOT NULL,
    "status" "public"."ArrivalStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LotArrival_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lot_lotId_key" ON "public"."Lot"("lotId");

-- CreateIndex
CREATE INDEX "Lot_lotId_idx" ON "public"."Lot"("lotId");

-- CreateIndex
CREATE INDEX "Lot_status_idx" ON "public"."Lot"("status");

-- CreateIndex
CREATE INDEX "Lot_createdAt_idx" ON "public"."Lot"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LotDetail_detailId_key" ON "public"."LotDetail"("detailId");

-- CreateIndex
CREATE INDEX "LotDetail_detailId_idx" ON "public"."LotDetail"("detailId");

-- CreateIndex
CREATE INDEX "LotDetail_lotId_idx" ON "public"."LotDetail"("lotId");

-- CreateIndex
CREATE UNIQUE INDEX "LotArrival_arrivalId_key" ON "public"."LotArrival"("arrivalId");

-- CreateIndex
CREATE INDEX "LotArrival_arrivalId_idx" ON "public"."LotArrival"("arrivalId");

-- CreateIndex
CREATE INDEX "LotArrival_lotId_idx" ON "public"."LotArrival"("lotId");

-- CreateIndex
CREATE INDEX "LotArrival_lotDetailId_idx" ON "public"."LotArrival"("lotDetailId");

-- CreateIndex
CREATE INDEX "LotArrival_status_idx" ON "public"."LotArrival"("status");

-- AddForeignKey
ALTER TABLE "public"."LotDetail" ADD CONSTRAINT "LotDetail_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "public"."Lot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LotArrival" ADD CONSTRAINT "LotArrival_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "public"."Lot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LotArrival" ADD CONSTRAINT "LotArrival_lotDetailId_fkey" FOREIGN KEY ("lotDetailId") REFERENCES "public"."LotDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
