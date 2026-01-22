-- AlterTable
ALTER TABLE "public"."RefreshToken" ADD COLUMN     "deviceId" TEXT;

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_deviceId_idx" ON "public"."RefreshToken"("deviceId");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."UserDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
