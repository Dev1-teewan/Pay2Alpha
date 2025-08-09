import React, { useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import ExpertCard from "../components/ExpertCard";
import BuyCreditsForm from "../components/BuyCreditsForm";
import ArtistRegistrationForm from "../components/ArtistRegistrationForm";
import PremiumMessageForm from "../components/PremiumMessageForm";
import { useWallet } from "../contexts/WalletContext";
import { ethers, type InterfaceAbi } from "ethers";
import { CONFIG } from "../config";
import Pay2AlphaAbi from "../abis/Pay2Alpha.json";

interface Expert {
  id: string; // address
  name: string;
  avatar: string;
  expertise: string[];
  rating: number;
  pricePerMessage: number;
  description: string;
  totalMessages: number;
}

const Experts: React.FC = () => {
  const { isConnected, provider } = useWallet();
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const [showArtistRegistration, setShowArtistRegistration] = useState(false);
  const [showPremiumForm, setShowPremiumForm] = useState(false);
  const [isArtist, setIsArtist] = useState<boolean | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const baseProvider = new ethers.JsonRpcProvider(
          CONFIG.base.rpcUrl,
          undefined,
          { staticNetwork: true }
        );
        const abi = Array.isArray(Pay2AlphaAbi)
          ? (Pay2AlphaAbi as unknown as InterfaceAbi)
          : (Pay2AlphaAbi as unknown as { abi: InterfaceAbi }).abi;
        const c = new ethers.Contract(CONFIG.base.pay2alpha, abi, baseProvider);

        const list: Expert[] = [];
        // Enumerate experts with pagination
        const total: bigint = await c.expertsCount();
        const pageSize = 50n;
        for (let offset = 0n; offset < total; offset += pageSize) {
          const limit = offset + pageSize > total ? total - offset : pageSize;
          if (limit <= 0n) break;
          const [addrs, exps]: [
            string[],
            { name: string; pricePerCredit: bigint }[]
          ] = await c.getExperts(offset, limit);
          for (let i = 0; i < addrs.length; i++) {
            const addr = addrs[i];
            const info = exps[i];
            if (!info || !info.name || info.name.length === 0) continue;
            list.push({
              id: addr,
              name: info.name,
              avatar: `https://api.dicebear.com/9.x/identicon/svg?seed=${addr}`,
              expertise: [],
              rating: 4.8,
              pricePerMessage: Number(info.pricePerCredit) / 1_000_000,
              description: "Verified expert",
              totalMessages: 0,
            });
          }
        }

        // Fallback: ensure connected wallet appears if registered
        if (provider) {
          try {
            const me = await (await provider.getSigner()).getAddress();
            if (!list.find((e) => e.id.toLowerCase() === me.toLowerCase())) {
              const mine = await c.experts(me);
              if (mine && mine.name && mine.name.length > 0) {
                list.push({
                  id: me,
                  name: mine.name,
                  avatar: `https://api.dicebear.com/9.x/identicon/svg?seed=${me}`,
                  expertise: [],
                  rating: 4.8,
                  pricePerMessage: Number(mine.pricePerCredit) / 1_000_000,
                  description: "Verified expert",
                  totalMessages: 0,
                });
              }
            }
          } catch {
            // ignore
          }
        }

        setExperts(list);

        // Track whether connected wallet is a registered expert
        if (provider) {
          try {
            const me = await (await provider.getSigner()).getAddress();
            const mine = await c.experts(me);
            setIsArtist(!!(mine && mine.name && mine.name.length > 0));
          } catch {
            setIsArtist(false);
          }
        } else {
          setIsArtist(false);
        }
      } catch (e) {
        console.error("Failed loading experts", e);
      }
    };
    load();
  }, [provider]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 rounded-xl text-center web3-glow">
          <h2 className="text-2xl font-bold text-white mb-4">
            Connect Your Web3 Wallet
          </h2>
          <p className="text-blue-200/80">
            Please connect your wallet to access the expert network
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Web3 <span className="gradient-text">Expert Network</span>
            </h1>
            <p className="text-blue-200/80">
              Connect with verified experts across DeFi, NFTs, and blockchain
              domains
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={async () => {
                try {
                  // Check if current wallet is registered; if yes, open premium form; else open register
                  const baseProvider = new ethers.JsonRpcProvider(
                    CONFIG.base.rpcUrl,
                    undefined,
                    { staticNetwork: true }
                  );
                  const abi = Array.isArray(Pay2AlphaAbi)
                    ? (Pay2AlphaAbi as unknown as InterfaceAbi)
                    : (Pay2AlphaAbi as unknown as { abi: InterfaceAbi }).abi;
                  const c = new ethers.Contract(
                    CONFIG.base.pay2alpha,
                    abi,
                    baseProvider
                  );
                  if (!provider) {
                    setShowArtistRegistration(true);
                    return;
                  }
                  const me = await (await provider.getSigner()).getAddress();
                  const info = await c.experts(me);
                  if (info && info.name && info.name.length > 0)
                    setShowPremiumForm(true);
                  else setShowArtistRegistration(true);
                } catch {
                  setShowArtistRegistration(true);
                }
              }}
              className="glass-button text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium web3-glow"
            >
              <UserPlus className="h-5 w-5" />
              <span>
                {isArtist ? "Send Premium Message" : "Register as Expert"}
              </span>
            </button>
            <button
              onClick={() => setShowBuyCredits(true)}
              className="glass-button text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium web3-glow"
            >
              <Plus className="h-5 w-5" />
              <span>Buy Credits</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              onBuyCredits={() => {
                setSelectedExpert(expert);
                setShowBuyCredits(true);
              }}
            />
          ))}
        </div>

        {showBuyCredits && (
          <BuyCreditsForm
            expert={selectedExpert}
            onClose={() => {
              setShowBuyCredits(false);
              setSelectedExpert(null);
            }}
          />
        )}

        {showArtistRegistration && (
          <ArtistRegistrationForm
            onClose={() => setShowArtistRegistration(false)}
          />
        )}
        {showPremiumForm && (
          <PremiumMessageForm onClose={() => setShowPremiumForm(false)} />
        )}
      </div>
    </div>
  );
};

export default Experts;
