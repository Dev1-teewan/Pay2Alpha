import React, { useState } from "react";
import { RotateCcw, Clock } from "lucide-react";
import { ethers } from "ethers";
import { useWallet } from "../contexts/WalletContext";
import { CONFIG } from "../config";
import Pay2AlphaAbi from "../abis/Pay2Alpha.json";

const RefundButton: React.FC = () => {
  const [isRefunding, setIsRefunding] = useState(false);
  const [unusedCredits] = useState(1);
  const { signer } = useWallet();

  const handleRefund = async () => {
    setIsRefunding(true);

    try {
      if (!signer) throw new Error("Connect wallet");
      const c = new ethers.Contract(
        CONFIG.base.pay2alpha,
        Pay2AlphaAbi as any,
        signer
      );
      const tx = await c.refundCredits(0, 1);
      await tx.wait();
      alert("Refunded 1 credit");
    } catch (error) {
      console.error("Failed to refund:", error);
      alert("Failed to refund credits. Please try again.");
    } finally {
      setIsRefunding(false);
    }
  };

  if (unusedCredits === 0) {
    return null;
  }

  return (
    <button
      onClick={handleRefund}
      disabled={isRefunding}
      className="glass-button text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium"
    >
      {isRefunding ? (
        <>
          <Clock className="h-4 w-4 animate-spin" />
          <span>Refunding...</span>
        </>
      ) : (
        <>
          <RotateCcw className="h-4 w-4" />
          <span>Refund {unusedCredits} Credits</span>
        </>
      )}
    </button>
  );
};

export default RefundButton;
