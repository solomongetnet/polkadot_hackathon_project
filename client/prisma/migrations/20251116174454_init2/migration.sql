/*
  Warnings:

  - You are about to drop the `Api` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[walletAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CharacterReport" DROP CONSTRAINT "CharacterReport_characterId_fkey";

-- DropForeignKey
ALTER TABLE "CharacterReport" DROP CONSTRAINT "CharacterReport_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "chat" DROP CONSTRAINT "chat_characterId_fkey";

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "isListedForSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nftContract" TEXT,
ADD COLUMN     "nftNetwork" TEXT,
ADD COLUMN     "nftTokenId" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "walletAddress" TEXT,
ADD COLUMN     "walletNetwork" TEXT;

-- DropTable
DROP TABLE "Api";

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterReport" ADD CONSTRAINT "CharacterReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterReport" ADD CONSTRAINT "CharacterReport_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
