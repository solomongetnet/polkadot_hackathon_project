"use client";

import type React from "react";
import { FormContainer } from "./form-container";
import { useGetCharacterForUpdateQuery } from "@/hooks/api/use-character";
import { useParams } from "next/navigation";
import Header from "./header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const params = useParams();
  const characterId = params.id;
  const {
    data: characterData,
    isPending,
    isLoading,
    isError,
  } = useGetCharacterForUpdateQuery(characterId as string, {
    enabled: !!characterId,
  });

  return (
    <main className="">
      <Header />

      {/* title */}
      <div className="w-full min-h-screen pb-10 px-4 sm:px-8 md:px-[150px] lg:px-[280px]">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Update AI Character
        </h1>

        {isLoading || isPending ? (
          <div className="w-full space-y-4 sm:space-y-6 px-4 sm:px-6">
            <Skeleton className="w-24 sm:w-26 h-24 sm:h-26 rounded-full"/>
            <Skeleton className="w-full h-[50px] sm:h-[60px] rounded-lg"/>
            <Skeleton className="w-full h-[50px] sm:h-[60px] rounded-lg"/>
            <Skeleton className="w-full h-[120px] sm:h-[160px] rounded-lg"/>
            <Skeleton className="w-full h-[50px] sm:h-[60px] rounded-lg"/>
            <Skeleton className="w-full h-[50px] sm:h-[60px] rounded-lg"/>
          </div>
        ) : isError ? (
          <div>Error occured</div>
        ) : (
          characterData && <FormContainer characterData={characterData} />
        )}
      </div>
    </main>
  );
}
