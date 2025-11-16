"use client";

import React from "react";

import { ethers } from "ethers";
import { Button } from "@/components/ui/button";

// export async function connectWallet(): Promise<string | null> {
  // try {
  //   if (!window.ethereum) {
  //     alert("MetaMask is not installed!");
  //     return null;
  //   }

  //   const provider = new ethers.BrowserProvider(window.ethereum);
  //   await provider.send("eth_requestAccounts", []);
  //   const signer = await provider.getSigner();
  //   const address = await signer.getAddress();

  //   return address;
  // } catch (error) {
  //   console.error("Wallet connection failed:", error);
  //   return null;
  // }
// }

const Page = () => {
  return (
    <div>
      <Button
        onClick={() => {
          // connectWallet();
        }}
      >
        Connect wallet
      </Button>
    </div>
  );
};

export default Page;
