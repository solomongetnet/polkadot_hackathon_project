import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Coins, Heart, MessageCircle } from "lucide-react";

const NftCard = ({ char }: { char: any }) => {
  const router = useRouter();

  return (
    <motion.div
      key={char.id}
      // whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative w-full h-[280px] md:h-[350px] rounded-sm shadow-xl cursor-pointer group overflow-hidden"
      onClick={() => {
        router.push(`/marketplace/${char.id}`);
      }}
    >
      {/* Background Image */}
      <img
        src={char.image}
        alt={char.name}
        className="object-cover h-full w-full group-hover:scale-110 transition-all duration-500 overflow-hidden "
      />

      <div className="absolute left-2 top-2 px-2 py-2 bg-black/30 rounded-full backdrop-blur-3xl">
        <Coins className="text-white" />
      </div>

      {/* Bottom Blur BACKGROUND ONLY (does NOT cover content) */}
      <div
        className="
      absolute bottom-0 left-0 right-0 h-[120px]
      bg-gradient-to-t from-black/85 via-black/60 to-transparent
      backdrop-blur-[10px]
      [mask-image:linear-gradient(to_top,black,transparent)]
      z-0
    "
      />

      {/* CONTENT (always above blur) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        {/* Profile + Name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/50">
            <img src={char.image} className="object-cover h-full w-full" />
          </div>

          <h1 className="text-white text-base font-semibold drop-shadow-lg">
            {char.name}
          </h1>
        </div>

        {/* <div className="flex w-full justify-between gap-2">
          <span>
            <MessageCircle />
          </span>

          <span>
            <Heart />
          </span>
        </div> */}

        {/* Price + Open Button */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-white font-semibold text-sm">
            {char.price} <span className="text-purple-300">DEV</span>
          </p>

          <Button className="px-3 py-1.5 text-xs bg transition rounded-md font-medium shadow-sm">
            Open
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default NftCard;
