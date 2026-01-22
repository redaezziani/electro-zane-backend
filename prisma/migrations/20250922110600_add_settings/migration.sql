/*
  Warnings:

  - The values [JSON] on the enum `SettingType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `value` on the `Setting` table. All the data in the column will be lost.
  - Added the required column `label` to the `Setting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SettingType_new" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'SELECT');
ALTER TABLE "public"."Setting" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."Setting" ALTER COLUMN "type" TYPE "public"."SettingType_new" USING ("type"::text::"public"."SettingType_new");
ALTER TYPE "public"."SettingType" RENAME TO "SettingType_old";
ALTER TYPE "public"."SettingType_new" RENAME TO "SettingType";
DROP TYPE "public"."SettingType_old";
ALTER TABLE "public"."Setting" ALTER COLUMN "type" SET DEFAULT 'STRING';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Setting" DROP COLUMN "value",
ADD COLUMN     "label" VARCHAR(100) NOT NULL,
ADD COLUMN     "options" TEXT,
ADD COLUMN     "valueBool" BOOLEAN,
ADD COLUMN     "valueNumber" DOUBLE PRECISION,
ADD COLUMN     "valueString" TEXT;
