-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "sellPrice" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."ProductSKU" ADD COLUMN     "initPrice" DECIMAL(10,2) NOT NULL DEFAULT 0;
