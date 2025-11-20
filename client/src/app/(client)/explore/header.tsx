"use client";
import { CharacterSearch } from "@/components/character-search";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { ChevronDown, Plus, Search, Text } from "lucide-react";
import Link from "next/link";
import React from "react";
import CategoryDropdown from "./category-dropdown";

const CharactersHeader = ({ title }: { title?: string }) => {
  const { isMobile, setOpenMobile, open, setOpen } = useSidebar();
  const { data: sessionData, isPending } = authClient.useSession();

  // mobile header
  return (
    <>
      <header className="md:hidden flex flex-col gap-2 w-full fixed top-0 right-0 bg-white dark:bg-[#181818] border-b-2 z-40 px-3 py-4 ">
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <span className="sticky top-0" onClick={() => setOpenMobile(true)}>
              <Text />
            </span>

            {title ? (
              <h2 className="font-md text-xl">{title}</h2>
            ) : (
              <CategoryDropdown />
            )}
          </div>

          {isPending || !sessionData?.session ? (
            <div className="flex items-center gap-4 absolute right-4">
              <Link href={"/auth"} prefetch>
                <Button size="sm" className="transition-colors rounded-full">
                  Login / Signup
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <CharacterSearch />
            </div>
          )}
        </div>
      </header>

      {/* large screen header */}
      <div className="max-md:hidden py-6 w-full flex justify-between items-center">
        {!open && (
          <Button
            variant={"default"}
            size={"icon"}
            className="rounded-full z-30 full fixed top-6 left-6"
            onClick={() => setOpen(true)}
          >
            <Text />
          </Button>
        )}

        <div className={`flex gap-2 items-center ${!open && "pl-10"}`}>
          {title ? (
            <h2 className="font-md text-xl">{title}</h2>
          ) : (
            <CategoryDropdown />
          )}
        </div>
        <div className="flex gap-2 items-center">
          <Button className="rounded-full h-[40px] aspect-square p-0 ">
            <Plus className="w-5" />
          </Button>

          <CharacterSearch mainContainerClassName="w-[260px] md:w-[360px]" />
        </div>
      </div>
    </>
  );
};

export default CharactersHeader;
