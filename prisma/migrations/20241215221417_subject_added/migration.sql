/*
  Warnings:

  - Added the required column `subject` to the `CodeRequest` table without a default value. This is not possible if the table is not empty.
  - Made the column `timeToRun` on table `CodeRequest` required. This step will fail if there are existing NULL values in that column.
  - Made the column `testsPassed` on table `CodeRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CodeRequest" ADD COLUMN     "subject" TEXT NOT NULL,
ALTER COLUMN "timeToRun" SET NOT NULL,
ALTER COLUMN "testsPassed" SET NOT NULL;
