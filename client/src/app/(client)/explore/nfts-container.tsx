"use client";

import React from "react";
import { nftCharacters } from "../marketplace/nfts-data";
import NftCard from "@/components/nft-card";
import Link from "next/link";

const NftsContainer = () => {
  return (
    <div className="mt-10 flex flex-col gap-4">
      <h2 className="text-lg">Nfts for sell</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {nftCharacters.slice(0, 5).map((nft) => {
          return <NftCard char={nft} />;
        })}
      </div>

      <div className="py-10 flex justify-center items-center w-full">
        <Link href={"/marketplace"}>More nfts</Link>
      </div>
    </div>
  );
};

export default NftsContainer;
2