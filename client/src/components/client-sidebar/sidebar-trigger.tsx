"use client";

import { Text, X } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { useSidebar } from "../ui/sidebar";

const CustomSidebarTrigger = ({
  show,
}: {
  show: "open" | "close" | "both";
}) => {
  const { open, setOpen, setOpenMobile, openMobile, isMobile } = useSidebar();

  const handleOpenSidebar = (bool: boolean) => {
    setOpen(bool);
    setOpenMobile(bool);
  };

  const shouldShowOpenButton =
    (show === "open" || show === "both") && (!open || !openMobile);

  const shouldShowCloseButton =
    (show === "close" || show === "both") && (open || openMobile);

  if (shouldShowOpenButton) {
    return (
      <Button
        variant={isMobile ? "default" : "ghost"}
        size="icon"
        onClick={() => handleOpenSidebar(true)}
      >
        <Text className="w-6" />
      </Button>
    );
  }

  if (shouldShowCloseButton) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleOpenSidebar(false)}
      >
        <X className="w-6" />
      </Button>
    );
  }

  // Ensure a fallback return
  return null;
};

export default CustomSidebarTrigger;
