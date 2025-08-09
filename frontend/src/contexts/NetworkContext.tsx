import React, { createContext, useContext, useState, ReactNode } from "react";
import { CONFIG } from "../config";

type Network = "base" | "sapphire";

interface NetworkContextType {
  currentNetwork: Network;
  switchNetwork: (network: Network) => Promise<void>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
}) => {
  const [currentNetwork, setCurrentNetwork] = useState<Network>("base");

  const switchNetwork = async (network: Network) => {
    try {
      if (network === "base") {
        const hex = CONFIG.base.chainHex;
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: hex }],
          });
        } catch (e: any) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hex,
                chainName: "Base Sepolia",
                rpcUrls: [CONFIG.base.rpcUrl],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                blockExplorerUrls: [],
              },
            ],
          });
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: hex }],
          });
        }
      } else if (network === "sapphire") {
        const hex = CONFIG.sapphire.chainHex;
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: hex }],
          });
        } catch (e: any) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hex,
                chainName: "Sapphire Testnet",
                rpcUrls: [CONFIG.sapphire.rpcUrl],
                nativeCurrency: { name: "ROSE", symbol: "ROSE", decimals: 18 },
                blockExplorerUrls: [],
              },
            ],
          });
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: hex }],
          });
        }
      }
      setCurrentNetwork(network);
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        currentNetwork,
        switchNetwork,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
