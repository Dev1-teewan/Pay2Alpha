import React, { useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { ethers } from "ethers";
import { useWallet } from "../contexts/WalletContext";
import { CONFIG } from "../config";
import { ensureChain } from "../utils/providers";

interface ApproveUSDCButtonProps {
  amount: number;
  onApproved: () => void;
}

const ApproveUSDCButton: React.FC<ApproveUSDCButtonProps> = ({
  amount,
  onApproved,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const { signer } = useWallet();

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      if (!signer) throw new Error("Connect wallet");
      // Ensure Base network for USDC approval and Pay2Alpha spend
      await ensureChain(CONFIG.base.chainHex);
      const erc20Abi = [
        "function approve(address spender,uint256 amount) returns (bool)",
      ];
      const token = new ethers.Contract(CONFIG.base.usdc, erc20Abi, signer);
      const amt = ethers.parseUnits(String(amount), 6);
      const tx = await token.approve(CONFIG.base.pay2alpha, amt);
      await tx.wait();
      setIsApproved(true);
      onApproved();
    } catch (error) {
      console.error("Failed to approve USDC:", error);
      alert("Failed to approve USDC. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  if (isApproved) {
    return (
      <button
        disabled
        className="w-full glass text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium"
      >
        <CheckCircle className="h-5 w-5 text-green-400" />
        <span>USDC Approved</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleApprove}
      disabled={isApproving}
      className="w-full glass-button text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium"
    >
      {isApproving ? (
        <>
          <Clock className="h-5 w-5 animate-spin" />
          <span>Approving...</span>
        </>
      ) : (
        <span>Approve {amount} USDC</span>
      )}
    </button>
  );
};

export default ApproveUSDCButton;
