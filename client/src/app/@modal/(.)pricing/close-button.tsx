"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const CloseButton = () => {
  const router = useRouter();
  return (
    <span
      className="fixed top-3 left-3 md:top-6 md:left-6 cursor-pointer hover:scale-[105%] z-[101]"
      onClick={() => router.back()}
    >
      <X className="w-14"/>
    </span>
  );
};

export default CloseButton;
