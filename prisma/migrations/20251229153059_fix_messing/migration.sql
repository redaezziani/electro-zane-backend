-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedById" TEXT,
ADD COLUMN     "language" VARCHAR(5) NOT NULL DEFAULT 'en';

-- CreateIndex
CREATE INDEX "Order_confirmedById_idx" ON "public"."Order"("confirmedById");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
