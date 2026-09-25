/*
  Warnings:

  - The values [PR,BD] on the enum `Committee` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Committee_new" AS ENUM ('SUPPLY_CHAIN', 'DCR', 'PUBLIC_RELATIONS', 'BUSINESS_DEVELOPMENT_EXTERNAL', 'ACADEMIC_RELATIONS', 'ENGINEERING', 'FILM_MAKING', 'BUSINESS_DEVELOPMENT_AC', 'PIONEERS', 'PEOPLE_AND_CULTURE', 'QC', 'TECHNICAL', 'MOBILE', 'FRONTEND_WEB', 'BACKEND', 'MARKETING', 'PHOTOGRAPHY', 'VIDEO_EDITING', 'GRAPHIC_DESIGN');
ALTER TABLE "Applicant" ALTER COLUMN "committee" TYPE "Committee_new" USING ("committee"::text::"Committee_new");
ALTER TYPE "Committee" RENAME TO "Committee_old";
ALTER TYPE "Committee_new" RENAME TO "Committee";
DROP TYPE "Committee_old";
COMMIT;
