/*
  Warnings:

  - You are about to drop the column `isListedForSale` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `nftContract` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `nftNetwork` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `nftTokenId` on the `Character` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Character` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nftId]` on the table `Character` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Character" DROP COLUMN "isListedForSale",
DROP COLUMN "nftContract",
DROP COLUMN "nftNetwork",
DROP COLUMN "nftTokenId",
DROP COLUMN "price",
ADD COLUMN     "nftId" TEXT;

-- CreateTable
CREATE TABLE "CharacterNft" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT,
    "contractAddress" TEXT,
    "chain" TEXT,
    "metaData" TEXT,
    "metadataOnChainUrl" TEXT,
    "isMinted" BOOLEAN NOT NULL DEFAULT false,
    "isForSale" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION,
    "currency" TEXT,
    "ownerWallet" TEXT,
    "coverImageUrl" TEXT,
    "style" TEXT,
    "rarity" TEXT,
    "isAnimated" BOOLEAN NOT NULL DEFAULT false,
    "hasSound" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterNft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Character_nftId_key" ON "Character"("nftId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_nftId_fkey" FOREIGN KEY ("nftId") REFERENCES "CharacterNft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
