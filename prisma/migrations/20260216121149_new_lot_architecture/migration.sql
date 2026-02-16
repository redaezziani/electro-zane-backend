/*
  Warnings:

  - You are about to drop the column `lotDetailId` on the `LotArrival` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `LotArrival` table. All the data in the column will be lost.
  - You are about to drop the `LotDetail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `shipmentId` to the `LotArrival` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalValue` to the `LotArrival` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PieceStatus" AS ENUM ('NEW', 'USED', 'REFURBISHED', 'DAMAGED', 'AVAILABLE', 'SHIPPED', 'ARRIVED');

-- CreateEnum
CREATE TYPE "public"."ShipmentStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'ARRIVED', 'VERIFIED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."LotArrival" DROP CONSTRAINT "LotArrival_lotDetailId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LotDetail" DROP CONSTRAINT "LotDetail_lotId_fkey";

-- DropIndex
DROP INDEX "public"."LotArrival_lotDetailId_idx";

-- AlterTable
ALTER TABLE "public"."Lot" ALTER COLUMN "totalPrice" SET DEFAULT 0,
ALTER COLUMN "totalQuantity" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."LotArrival" DROP COLUMN "lotDetailId",
DROP COLUMN "price",
ADD COLUMN     "shipmentId" TEXT NOT NULL,
ADD COLUMN     "totalValue" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "verifiedBy" TEXT;

-- DropTable
DROP TABLE "public"."LotDetail";

-- CreateTable
CREATE TABLE "public"."LotPiece" (
    "id" TEXT NOT NULL,
    "pieceId" SERIAL NOT NULL,
    "lotId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "status" "public"."PieceStatus" NOT NULL DEFAULT 'NEW',
    "color" VARCHAR(50),
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LotPiece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Shipment" (
    "id" TEXT NOT NULL,
    "shipmentId" SERIAL NOT NULL,
    "shippingCompany" VARCHAR(200) NOT NULL,
    "shippingCompanyCity" VARCHAR(100) NOT NULL,
    "status" "public"."ShipmentStatus" NOT NULL DEFAULT 'PENDING',
    "trackingNumber" VARCHAR(100),
    "estimatedArrival" TIMESTAMP(3),
    "actualArrival" TIMESTAMP(3),
    "totalPieces" INTEGER NOT NULL DEFAULT 0,
    "totalValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShipmentPiece" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "lotPieceId" TEXT NOT NULL,
    "quantityShipped" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipmentPiece_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LotPiece_pieceId_key" ON "public"."LotPiece"("pieceId");

-- CreateIndex
CREATE INDEX "LotPiece_pieceId_idx" ON "public"."LotPiece"("pieceId");

-- CreateIndex
CREATE INDEX "LotPiece_lotId_idx" ON "public"."LotPiece"("lotId");

-- CreateIndex
CREATE INDEX "LotPiece_status_idx" ON "public"."LotPiece"("status");

-- CreateIndex
CREATE INDEX "LotPiece_name_idx" ON "public"."LotPiece"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_shipmentId_key" ON "public"."Shipment"("shipmentId");

-- CreateIndex
CREATE INDEX "Shipment_shipmentId_idx" ON "public"."Shipment"("shipmentId");

-- CreateIndex
CREATE INDEX "Shipment_status_idx" ON "public"."Shipment"("status");

-- CreateIndex
CREATE INDEX "Shipment_trackingNumber_idx" ON "public"."Shipment"("trackingNumber");

-- CreateIndex
CREATE INDEX "Shipment_createdAt_idx" ON "public"."Shipment"("createdAt");

-- CreateIndex
CREATE INDEX "ShipmentPiece_shipmentId_idx" ON "public"."ShipmentPiece"("shipmentId");

-- CreateIndex
CREATE INDEX "ShipmentPiece_lotPieceId_idx" ON "public"."ShipmentPiece"("lotPieceId");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentPiece_shipmentId_lotPieceId_key" ON "public"."ShipmentPiece"("shipmentId", "lotPieceId");

-- CreateIndex
CREATE INDEX "LotArrival_shipmentId_idx" ON "public"."LotArrival"("shipmentId");

-- CreateIndex
CREATE INDEX "LotArrival_createdAt_idx" ON "public"."LotArrival"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."LotPiece" ADD CONSTRAINT "LotPiece_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "public"."Lot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShipmentPiece" ADD CONSTRAINT "ShipmentPiece_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "public"."Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShipmentPiece" ADD CONSTRAINT "ShipmentPiece_lotPieceId_fkey" FOREIGN KEY ("lotPieceId") REFERENCES "public"."LotPiece"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LotArrival" ADD CONSTRAINT "LotArrival_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "public"."Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
