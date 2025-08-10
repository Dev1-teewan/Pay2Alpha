import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";

interface WalletContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  type Eip1193 = {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };

  const rehydrateFromInjected = async () => {
    const eth = (window as unknown as { ethereum?: Eip1193 }).ethereum;
    if (!eth) return;
    const nextProvider = new ethers.BrowserProvider(
      eth as unknown as ethers.Eip1193Provider
    );
    const nextSigner = await nextProvider.getSigner();
    const addr = await nextSigner.getAddress();

    setProvider(nextProvider);
    setSigner(nextSigner);
    setAccount(addr);
    setIsConnected(true);
  };

  const connectWallet = async () => {
    const eth = (window as unknown as { ethereum?: Eip1193 }).ethereum;
    if (eth) {
      try {
        const provider = new ethers.BrowserProvider(
          eth as unknown as ethers.Eip1193Provider
        );
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setAccount(address);
        setIsConnected(true);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
  };

  useEffect(() => {
    const eth = (window as unknown as { ethereum?: Eip1193 }).ethereum;
    if (eth) {
      const onAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          rehydrateFromInjected().catch(() => {});
        }
      };
      const onChainChanged = () => {
        // Do not reload; just rehydrate the provider/signer on the new chain
        rehydrateFromInjected().catch(() => {});
      };
      // Some providers expose `on`; fall back to addEventListener-style if absent
      // @ts-expect-error provider may support `on`
      if (typeof (eth as any).on === "function") {
        // @ts-expect-error dynamic
        (eth as any).on("accountsChanged", onAccountsChanged);
        // @ts-expect-error dynamic
        (eth as any).on("chainChanged", onChainChanged);
      }

      return () => {
        try {
          if (typeof (eth as any).removeListener === "function") {
            (eth as any).removeListener("accountsChanged", onAccountsChanged);
            (eth as any).removeListener("chainChanged", onChainChanged);
          }
        } catch {
          /* noop */
        }
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        isConnected,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
