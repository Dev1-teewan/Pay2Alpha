import React, { useState } from "react";
import { Gift, Clock } from "lucide-react";
import { ethers } from "ethers";
import { useWallet } from "../contexts/WalletContext";
import { CONFIG } from "../config";
import Pay2AlphaAbi from "../abis/Pay2Alpha.json";

const ClaimButton: React.FC = () => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [availableToClaim] = useState(1);
  const { signer } = useWallet();

  const handleClaim = async () => {
    setIsClaiming(true);

    try {
      if (!signer) throw new Error("Connect wallet");
      const c = new ethers.Contract(
        CONFIG.base.pay2alpha,
        Pay2AlphaAbi as any,
        signer
      );
      // For demo, claim on recordId 0 and 1 credit
      const tx = await c.claimCredits(0, 1);
      await tx.wait();
      alert("Claimed 1 credit");
    } catch (error) {
      console.error("Failed to claim:", error);
      alert("Failed to claim earnings. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  if (availableToClaim === 0) {
    return null;
  }

  return (
    <button
      onClick={handleClaim}
      disabled={isClaiming}
      className="glass-button text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium"
    >
      {isClaiming ? (
        <>
          <Clock className="h-4 w-4 animate-spin" />
          <span>Claiming...</span>
        </>
      ) : (
        <>
          <Gift className="h-4 w-4" />
          <span>Claim ${availableToClaim}</span>
        </>
      )}
    </button>
  );
};

export default ClaimButton;
