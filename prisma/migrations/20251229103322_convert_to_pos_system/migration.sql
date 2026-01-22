/*
  Warnings:

  - You are about to drop the column `billingAddress` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingEmail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `billingName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddress` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingEmail` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingPhone` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `customerName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropIndex
DROP INDEX "public"."Order_userId_idx";

-- DropIndex
DROP INDEX "public"."Payment_userId_idx";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "billingAddress",
DROP COLUMN "billingEmail",
DROP COLUMN "billingName",
DROP COLUMN "shippingAddress",
DROP COLUMN "shippingEmail",
DROP COLUMN "shippingName",
DROP COLUMN "shippingPhone",
DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customerAddress" JSONB,
ADD COLUMN     "customerEmail" VARCHAR(255),
ADD COLUMN     "customerName" VARCHAR(100) NOT NULL,
ADD COLUMN     "customerPhone" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "userId",
ADD COLUMN     "processedById" TEXT;

-- CreateIndex
CREATE INDEX "Order_createdById_idx" ON "public"."Order"("createdById");

-- CreateIndex
CREATE INDEX "Order_customerPhone_idx" ON "public"."Order"("customerPhone");

-- CreateIndex
CREATE INDEX "Payment_processedById_idx" ON "public"."Payment"("processedById");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
