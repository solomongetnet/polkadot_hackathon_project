"use client";

import React, { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, Check, X } from "lucide-react";

const sortOptions = ["Default", "Newest", "Likes", "Popular"];

const FilterModal = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sortParam = searchParams.get("sortBy");
  const queryParam = searchParams.get("q");

  // Get current sortBy from search params or default
  const currentSortBy = useMemo(() => {
    return sortParam && sortOptions.includes(sortParam) ? sortParam : "Default";
  }, [searchParams]);

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sort);

    // Update the URL without refreshing
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/search`);
  };

  return (
    <div className="flex gap-1 sm:gap-2">
      {(queryParam || sortParam) && (
        <Button size={"icon"} variant={"outline"} onClick={clearFilters} className="rounded-full">
          <X />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"outline"} className="rounded-full" size={"icon"}>
            <ArrowUpDown />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => handleSortChange(option)}
              className="flex justify-between items-center"
            >
              <span className={currentSortBy === option ? "font-semibold" : ""}>
                {option}
              </span>
              {currentSortBy === option && <Check className="w-4 h-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default FilterModal;
