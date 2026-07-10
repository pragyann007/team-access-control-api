/*
  Warnings:

  - You are about to drop the column `organizatioId` on the `Invitations` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `Invitations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Invitations" DROP CONSTRAINT "Invitations_organizatioId_fkey";

-- AlterTable
ALTER TABLE "Invitations" DROP COLUMN "organizatioId",
ADD COLUMN     "organizationId" INTEGER NOT NULL,
ALTER COLUMN "expiresAt" DROP NOT NULL,
ALTER COLUMN "acceptedAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "prisma" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "prisma_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Memberships" ADD CONSTRAINT "Memberships_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitations" ADD CONSTRAINT "Invitations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
