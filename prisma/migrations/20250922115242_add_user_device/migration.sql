-- CreateTable
CREATE TABLE "public"."UserDevice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ip" VARCHAR(45) NOT NULL,
    "userAgent" VARCHAR(500),
    "deviceType" VARCHAR(100),
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserDevice_userId_idx" ON "public"."UserDevice"("userId");

-- CreateIndex
CREATE INDEX "UserDevice_ip_idx" ON "public"."UserDevice"("ip");

-- CreateIndex
CREATE INDEX "UserDevice_lastUsedAt_idx" ON "public"."UserDevice"("lastUsedAt");

-- AddForeignKey
ALTER TABLE "public"."UserDevice" ADD CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
