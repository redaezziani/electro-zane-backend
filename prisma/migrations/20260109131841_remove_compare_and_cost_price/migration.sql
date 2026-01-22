/*
  Warnings:

  - You are about to drop the column `comparePrice` on the `ProductSKU` table. All the data in the column will be lost.
  - You are about to drop the column `costPrice` on the `ProductSKU` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ProductSKU" DROP COLUMN "comparePrice",
DROP COLUMN "costPrice";
