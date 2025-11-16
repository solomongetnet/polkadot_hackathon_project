"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useGetRandomCharactersQuery } from "@/hooks/api/use-character";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

// 🖼️ Banner images
import Banner1 from "@/assets/images/banner-2.jpg";
import Banner2 from "@/assets/images/banner-4.jpg";
import Banner3 from "@/assets/images/banner-5.jpg";
import Banner4 from "@/assets/images/banner-6.webp";
import Banner5 from "@/assets/images/banner-7.jpg";
import Banner6 from "@/assets/images/banner-8.jpg";
import Banner7 from "@/assets/images/banner-9.jpg";
import Banner8 from "@/assets/images/banner-10.jpg";
import { CharacterCard } from "@/components/character-card";
import { useGetCharactersQuery } from "@/hooks/api/use-character";

const bannerImages = [
  Banner1,
  Banner2,
  Banner3,
  Banner4,
  Banner5,
  Banner6,
  Banner7,
  Banner8,
];

// 📝 Matching text content per banner image
const bannerTexts = [
  { title: "Learn something new today", sub: "What do you want to do?" },
  { title: "Talk to a helpful friend", sub: "Feeling bored or curious?" },
  { title: "Unleash your creativity", sub: "Try creating a character!" },
  { title: "Explore new perspectives", sub: "Chat with unique minds" },
  { title: "Start your AI journey", sub: "Discover powerful characters" },
  {
    title: "Your world, your rules",
    sub: "Build characters that match your vibe",
  },
  { title: "Laugh, vent, or get deep", sub: "Characters that just get you" },
  {
    title: "The next convo is a click away",
    sub: "Pick a character and dive in",
  },
];

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const RandomCharacterContainer = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const randomCharacters = useGetRandomCharactersQuery({ limit: 2 });
  const homeCharactersQuery = useGetCharactersQuery({
    enabled: false,
    input: { limit: 12 },
    clearCache: true,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      handleImageTransition();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentImageIndex]);

  const handleImageTransition = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleRefreshCharacters = () => {
    randomCharacters.refetch();
    homeCharactersQuery.refetch();
    handleImageTransition();
  };

  return (
    <div className="pt-8 md:pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:h-[250px]">
      <div className="flex-1 max-md:h-[200px] relative w-full h-full rounded-3xl overflow-hidden">
        <div className="z-1 absolute inset-0 bg-gradient-to-t from-black/60 via-black/70 to-transparent" />
        <div className="z-1 absolute p-5 inset-0 w-full h-full flex flex-col justify-between">
          <div className="text-white flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${currentImageIndex}`}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.5 }}
                className="text-base text-muted-foreground"
              >
                {bannerTexts[currentImageIndex].sub}
              </motion.p>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.h2
                key={`title-${currentImageIndex}`}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-xl font-medium"
              >
                {bannerTexts[currentImageIndex].title}
              </motion.h2>
            </AnimatePresence>
          </div>
          <Button
            size={"icon"}
            className="rounded-full"
            variant={"outline"}
            disabled={randomCharacters.isPending}
            onClick={handleRefreshCharacters}
          >
            <RefreshCw
              className={`w-5 h-5 ${
                randomCharacters.isPending ||
                randomCharacters.isLoading ||
                (randomCharacters.isFetching && "animate-spin")
              }`}
            />
          </Button>
        </div>
        <div className="absolute inset-0 w-full h-full">
          {bannerImages.map((image, index) => (
            <Image
              key={index}
              alt={`Banner ${index + 1}`}
              src={image || "/placeholder.svg"}
              width={600}
              height={600}
              className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-300 ease-in-out ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-sm:hidden max-md:h-[200px]">
        {randomCharacters.isPending || randomCharacters.isError ? (
          <div className="max-md:h-[200px] w-full flex gap-2 justify-between">
            <Skeleton className="w-full h-full rounded-xl shadow" />
            <Skeleton className="w-full h-full rounded-xl shadow" />
          </div>
        ) : (
          <div className="h-full max-w-full flex gap-2 justify-between overflow-x-auto pb-2 ">
            {randomCharacters.data &&
              randomCharacters.data?.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  variant="compact"
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomCharacterContainer;
