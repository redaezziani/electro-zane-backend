-- CreateTable
CREATE TABLE "public"."RolePermission" (
    "id" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "permission" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RolePermission_role_idx" ON "public"."RolePermission"("role");

-- CreateIndex
CREATE INDEX "RolePermission_permission_idx" ON "public"."RolePermission"("permission");

-- CreateIndex
CREATE INDEX "RolePermission_isActive_idx" ON "public"."RolePermission"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_permission_key" ON "public"."RolePermission"("role", "permission");
