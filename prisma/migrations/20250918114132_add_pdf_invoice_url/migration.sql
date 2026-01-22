-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "invoiceFileId" VARCHAR(200) DEFAULT '',
ADD COLUMN     "invoiceUrl" VARCHAR(500) DEFAULT '';

-- AlterTable
ALTER TABLE "public"."ProductSKUImage" ADD COLUMN     "fileId" VARCHAR(200) DEFAULT '';
