import {
  BrushCleaning,
  ChevronRight,
  Palette,
  User,
  Volume2,
} from "lucide-react";
import React from "react";
import ThemeModal from "./theme-modal";
import ClearChatHistoryModal from "./clear-chat-modal";

const SettingsTab = () => {
  return (
    <div className="px-4 py-6 overflow-y-scroll ">
      <header className="space-y-3">
        <h2 className="text-base font-semibold">Settings</h2>
      </header>

      <main className="py-5 ">
        <ul className="flex flex-col gap-1">
          <ThemeModal>
            <li className="px-2 py-2 flex justify-between items-center hover:bg-accent transition rounded-md cursor-pointer">
              <div className="flex gap-2 items-center">
                <Palette className="max-w-4 " />{" "}
                <h2 className="text-xs">Customize</h2>
              </div>
              <ChevronRight className="max-w-4 text-muted-foreground" />
            </li>
          </ThemeModal>
          <li className="px-2 py-3 flex justify-between items-center hover:bg-accent transition rounded-md cursor-pointer">
            <div className="flex gap-2 items-center">
              <User className="max-w-4 " /> <h2 className="text-xs">Persona</h2>
            </div>
            <ChevronRight className="max-w-4 text-muted-foreground" />
          </li>

          <ClearChatHistoryModal>
            <li className="px-2 py-3 flex justify-between items-center hover:bg-accent transition rounded-md cursor-pointer">
              <div className="flex gap-2 items-center">
                <BrushCleaning className="max-w-4 " />{" "}
                <h2 className="text-xs">Clear history</h2>
              </div>
              <ChevronRight className="max-w-4 text-muted-foreground" />
            </li>
          </ClearChatHistoryModal>
        </ul>
      </main>
    </div>
  );
};

export default SettingsTab;
