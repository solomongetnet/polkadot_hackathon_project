"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { nftCharacters } from "./nfts-data";
import CharactersHeader from "../explore/header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import NftCard from "@/components/nft-card";

const Page = () => {
  const router = useRouter();

  return (
    <div
      className={`max-md:px-3 max-md:py-12 md:px-8  dark:bg-[#181818] bg-accent overflow-y-scroll relative min-h-screen`}
    >
      <CharactersHeader title={"Nft Marketplace"} />

      <div className="max-md:pt-12 ">
        <div className="grid max-md:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-3">
          {[...nftCharacters, ...nftCharacters].map((char) => (
            <NftCard char={char} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
