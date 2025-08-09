import { ethers } from "ethers";
import * as sapphire from "@oasisprotocol/sapphire-paratime";
import { CONFIG } from "../config";

export const getBaseProvider = async (): Promise<ethers.BrowserProvider> => {
  if (!window.ethereum) throw new Error("No wallet provider");
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider;
};

export const getSapphireProvider =
  async (): Promise<ethers.BrowserProvider> => {
    if (!window.ethereum) throw new Error("No wallet provider");
    // Wrap injected provider for Sapphire
    const wrapped = sapphire.wrapEthereumProvider(window.ethereum);
    const provider = new ethers.BrowserProvider(wrapped);
    return provider;
  };

export const ensureChain = async (targetChainHex: string) => {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainHex }],
    });
  } catch (e: any) {
    // Best-effort add then switch
    // Caller should provide add params if needed in their context
  }
};


