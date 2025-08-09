import React, { useState } from "react";
import { RotateCcw, Clock } from "lucide-react";
import { ethers, type InterfaceAbi } from "ethers";
import { useWallet } from "../contexts/WalletContext";
import { CONFIG } from "../config";
import Pay2AlphaAbi from "../abis/Pay2Alpha.json";
import { ensureChain } from "../utils/providers";

const RefundButton: React.FC = () => {
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundableRecordId, setRefundableRecordId] = useState<bigint | null>(
    null
  );
  const [unusedCredits, setUnusedCredits] = useState(0);
  const { signer } = useWallet();

  const refreshRefundable = async () => {
    try {
      if (!signer) return;
      const base = new ethers.JsonRpcProvider(CONFIG.base.rpcUrl, undefined, {
        staticNetwork: true,
      });
      const imported = Pay2AlphaAbi as unknown;
      const abi: InterfaceAbi = Array.isArray(imported)
        ? (imported as InterfaceAbi)
        : (imported as { abi: InterfaceAbi }).abi;
      const c = new ethers.Contract(CONFIG.base.pay2alpha, abi, base);
      const me = await signer.getAddress();
      const n: bigint = await c.recordCount();
      let found: { id: bigint; available: number } | null = null;
      for (let i = 0n; i < n; i++) {
        const r = await c.records(i);
        if (ethers.getAddress(r.client) !== ethers.getAddress(me)) continue;
        const available = Number(r.credits - r.creditsUsed);
        if (available > 0) {
          found = { id: i, available };
          break;
        }
      }
      setRefundableRecordId(found ? found.id : null);
      setUnusedCredits(found ? found.available : 0);
    } catch {
      setRefundableRecordId(null);
      setUnusedCredits(0);
    }
  };

  // Load once when the button mounts
  React.useEffect(() => {
    refreshRefundable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer]);

  const handleRefund = async () => {
    setIsRefunding(true);

    try {
      if (!signer) throw new Error("Connect wallet");
      if (refundableRecordId === null) throw new Error("No refundable credits");
      await ensureChain(CONFIG.base.chainHex);
      const imported = Pay2AlphaAbi as unknown;
      const abi: InterfaceAbi = Array.isArray(imported)
        ? (imported as InterfaceAbi)
        : (imported as { abi: InterfaceAbi }).abi;
      const c = new ethers.Contract(CONFIG.base.pay2alpha, abi, signer);
      const tx = await c.refundCredits(refundableRecordId, 1n);
      await tx.wait();
      alert("Refunded 1 credit");
      await refreshRefundable();
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
          <span>Refund 1 Credit</span>
        </>
      )}
    </button>
  );
};

export default RefundButton;
