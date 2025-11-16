import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const CharactersFooter = () => {
  return (
    <div className="pb-10 pt-28">
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-mono">Create a Character</h2>
          <p className="text-xs text-muted-foreground">
            Not vibing with any Characters? Create one of your own! Customize
            <br className="hidden md:block" />
            things like their voice, conversation starts, their tone, and more!
          </p>
        </div>

        <div>
          <Link href={"/create"}>
            <Button className="md:py-4 rounded-full text-center text-sm">
              Create a Character
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CharactersFooter;
