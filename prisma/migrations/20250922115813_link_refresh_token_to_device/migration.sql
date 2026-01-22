/*
  Warnings:

  - A unique constraint covering the columns `[userId,ip]` on the table `UserDevice` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userAgent` on table `UserDevice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `deviceType` on table `UserDevice` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."UserDevice_lastUsedAt_idx";

-- AlterTable
ALTER TABLE "public"."UserDevice" ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "country" VARCHAR(50),
ALTER COLUMN "ip" SET DATA TYPE TEXT,
ALTER COLUMN "userAgent" SET NOT NULL,
ALTER COLUMN "userAgent" SET DATA TYPE TEXT,
ALTER COLUMN "deviceType" SET NOT NULL,
ALTER COLUMN "deviceType" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_userId_ip_key" ON "public"."UserDevice"("userId", "ip");
