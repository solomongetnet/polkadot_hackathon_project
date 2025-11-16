"use client";

import SettingsModal from "@/components/setting-modal";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const SettingModalWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        className="rounded-full px-6 md:px-8"
        variant={"outline"}
        onClick={() => setIsOpen(true)}
      >
        Settings
      </Button>

      <SettingsModal open={isOpen} setIsSettingsModalOpen={setIsOpen} />
    </>
  );
};

export default SettingModalWrapper;
