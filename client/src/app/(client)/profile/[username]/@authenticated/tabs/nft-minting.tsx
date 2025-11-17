import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NftMintingModal = ({
  open,
  setIsOpen,
  characterId,
  setSelectedIdToMint,
}: {
  open: any;
  setIsOpen: any;
  characterId: string;
  setSelectedIdToMint: any;
}) => {
  const handleClose = () => {
    setIsOpen(false);
    setSelectedIdToMint(null);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-white/10 backdrop-blur-sm transition-all duration-300"
          onClick={handleClose}
        />
      )}

      <Dialog open={open} onOpenChange={setIsOpen}>
        <DialogContent className="h-fit py-8 w-[400px] rounded-lg bg-white/70 dark:bg-[black]/80">
          <DialogHeader>
            <DialogTitle>Convert to NFT</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-4 gap-2">
            <Input
              className="w-full py-6 shadow-lg"
              placeholder="Price in ETH (e.g., 0.0002)"
            />{" "}
            <Input
              className="w-full py-6 shadow-lg"
              placeholder={"Cover Image Url"}
            />
            <Button className="py-6 w-full rounded-full mt-2">
              Mint as nft
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NftMintingModal;
