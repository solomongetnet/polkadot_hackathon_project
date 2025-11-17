"use client";

import { useGetCharactersForSellQuery } from "@/hooks/api/use-character";
import React from "react";

const Page = () => {
  const dataQuery = useGetCharactersForSellQuery();

  
  return <div></div>;
};

export default Page;
