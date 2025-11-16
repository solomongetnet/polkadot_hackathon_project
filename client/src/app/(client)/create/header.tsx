"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const Header = () => {
  const router = useRouter();

  return (
    <header className="px-4 sm:px-8 md:px-[80px] w-full py-6 md:py-10">
      <span onClick={() => router.back()}>
        <ChevronLeft />
      </span>
    </header>
  );
};

export default Header;
