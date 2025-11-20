import React from "react";
import CharactersHeader from "./explore/header";
import RandomCharacterContainer from "./explore/random-character-container";
import CharactersFooter from "./explore/footer";
import CharactersContainer from "./explore/characters-container";
import NftsContainer from "./explore/nfts-container";

const HomePage = async ({ searchParams }: { searchParams: any }) => {
  const categorySearchParam = await searchParams.category;
  const pageSearchParam = await searchParams.page;
  return (
    <div
      className={`max-md:p-3 md:px-8 dark:bg-[#181818] bg-accent overflow-y-scroll relative `}
    >
      <CharactersHeader />

      <div className="max-md:pt-12">
        <RandomCharacterContainer />
        <CharactersContainer />
        <NftsContainer/>
        <CharactersFooter />
      </div>
    </div>
  );
};

export default HomePage;
