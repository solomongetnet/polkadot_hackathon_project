import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/store";
import React from "react";

const AboutTab = () => {
  const characterData = useChatStore(
    (state) => state.activeChatData?.character
  );

  return (
    <div className="px-4 py-6 overflow-y-scroll ">
      <main className="flex flex-col gap-2">
        <h2 className="text-base font-semibold">About</h2>
        <div>
          <p className="text-sm text-muted-foreground">
            {characterData?.description}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">Personality</h2>
          <div className="flex flex-wrap gap-2">
            {characterData?.personality?.split(",").map((trait, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {trait}
              </Badge>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AboutTab;
