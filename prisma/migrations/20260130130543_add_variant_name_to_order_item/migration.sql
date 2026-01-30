-- AlterTable
ALTER TABLE "public"."LotDetail" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "variantName" VARCHAR(200);
