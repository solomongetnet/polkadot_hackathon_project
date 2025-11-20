"use client";

import { ChevronLeft, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { nftCharacters } from "../nfts-data";

export default function Page() {
  const params = useParams();
  const id = params.id as any;

  const router = useRouter();
  const data = nftCharacters.find((n) => {
    return n.id.toString() === id!;
  });

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Vignette Effect */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${data?.image})`,
          backgroundAttachment: "fixed",
        }}
      >
        {/* Left Blur Vignette */}
        <div
          className="absolute inset-y-0 left-0 w-[100%] bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none"
          style={{
            backdropFilter: "blur(8px)",
          }}
        />

        {/* Right Blur Vignette */}
        <div
          className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black/90 via-black/40 to-transparent pointer-events-none"
          style={{}}
        />

        {/* Center Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Header Navigation */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <button
            className="text-white/70 hover:text-white transition-colors p-2"
            onClick={() => {
              router.back();
            }}
          >
            <ChevronLeft size={24} />
          </button>
          {/* <button className="text-white/70 hover:text-white transition-colors p-2">
            <Bookmark size={24} />
          </button> */}
        </div>

        {/* Centered Content Container */}
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl">
              <img
                src={data?.image}
                alt="Levi Ackerman"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-white text-lg font-semibold tracking-wide">
                Levi Ackerman
              </h2>
              <p className="text-white/60 text-sm">By @CharmingWorm6715</p>
            </div>
          </div>

          {/* Title Section */}
          <div className="space-y-3">
            <p className="text-white/50 text-sm uppercase tracking-widest">
              Story
            </p>
            <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight text-balance">
              Forest Camping With Captain Levi
            </h1>
          </div>

          {/* Body Text */}
          <div className="space-y-6 pt-4">
            <p className="text-white/80 text-base leading-relaxed text-pretty">
              You and Captain Levi haven't seen eye-to-eye for months, and it's
              gotten bad enough that the higher-ups, tired of the constant
              tension, came up with a brilliant plan: A three-day
              "team-building" camping trip in the middle of nowhere.
            </p>

            <p className="text-white/80 text-base leading-relaxed text-pretty">
              Now, surrounded by nothing but trees, cold wind, and the sound of
              rustling leaves, you find yourself sitting across from humanity's
              strongest soldier — the man you've spent months arguing with.
              There's no escape, no missions, no Titans. Just you, him, and the
              awkward silence hanging heavier than the night air.
            </p>

            <p className="text-white/80 text-base leading-relaxed text-pretty">
              Orders are orders. You're supposed to "learn to cooperate." Or at
              least pretend to.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <Button className=" rounded-full px-8 py-6 font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
              Buy This Nft (0.003 ETH)
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
