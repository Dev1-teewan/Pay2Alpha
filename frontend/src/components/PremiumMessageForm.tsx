import React, { useState } from "react";
import { X, Send, Lock } from "lucide-react";
import { ethers } from "ethers";
import * as sapphire from "@oasisprotocol/sapphire-paratime";
import { CONFIG } from "../config";
import { generateKey } from "../utils/crypto";
import SapphireChatAbi from "../abis/SapphireChatRecords.json";

interface PremiumMessageFormProps {
  onClose: () => void;
}

const PremiumMessageForm: React.FC<PremiumMessageFormProps> = ({ onClose }) => {
  const [client, setClient] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  type Eip1193Provider = {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };

  const switchToSapphire = async () => {
    const hex = CONFIG.sapphire.chainHex;
    try {
      const eth = (window as unknown as { ethereum?: Eip1193Provider })
        .ethereum;
      if (!eth) throw new Error("No injected wallet (ethereum) found");
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hex }],
      });
    } catch {
      const eth = (window as unknown as { ethereum?: Eip1193Provider })
        .ethereum;
      if (!eth) throw new Error("No injected wallet (ethereum) found");
      await eth.request({
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
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hex }],
      });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await switchToSapphire();

      // Temporary: no IPFS. Use message text as the CID payload directly.
      const secret = generateKey();
      const cid = message.trim();

      const eth = (window as unknown as { ethereum?: Eip1193Provider })
        .ethereum;
      if (!eth) throw new Error("No injected wallet (ethereum) found");
      const wrapped = sapphire.wrapEthersProvider(
        eth as unknown as Eip1193Provider
      );
      const provider = new ethers.BrowserProvider(
        wrapped as unknown as Eip1193Provider
      );
      const signer = await provider.getSigner();
      const importedAbi = SapphireChatAbi as unknown;
      let abi: ethers.InterfaceAbi;
      if (Array.isArray(importedAbi)) {
        abi = importedAbi as ethers.InterfaceAbi;
      } else if (
        importedAbi &&
        typeof importedAbi === "object" &&
        "abi" in (importedAbi as Record<string, unknown>)
      ) {
        abi = (importedAbi as { abi: ethers.InterfaceAbi }).abi;
      } else {
        throw new Error("Invalid ABI JSON for SapphireChatRecords");
      }
      const chat = new ethers.Contract(CONFIG.sapphire.chat, abi, signer);
      const me = await signer.getAddress();
      const secretBytes = ethers.toUtf8Bytes(secret);
      const clientAddr = client.trim()
        ? ethers.getAddress(client.trim())
        : ethers.ZeroAddress;
      const tx = await chat.createRecord(me, clientAddr, cid, secretBytes);
      await tx.wait();
      alert("Premium message sent (record created on Sapphire)");
      onClose();
    } catch (err) {
      console.error(err);
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: unknown }).message)
          : String(err);
      if (msg.toLowerCase().includes("only expert")) {
        alert(
          "Reverted: only expert. You must call createRecord from the same address as the expert. Switch wallet to the artist address and try again."
        );
      } else {
        alert("Failed to send message. Check address/network and try again.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card p-6 rounded-xl max-w-xl w-full web3-glow">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="glass p-2 rounded-full">
              <Lock className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              Send Premium Message
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200/60 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-blue-200/80 text-sm font-medium mb-2">
              Client Address
            </label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="0x..."
              className="glass-input w-full px-4 py-3 rounded-lg text-white placeholder-blue-200/50"
              pattern="^(0x)?[0-9a-fA-F]{40}$"
            />
          </div>

          <div>
            <label className="block text-blue-200/80 text-sm font-medium mb-2">
              Message
            </label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Type your premium insight..."
              className="glass-input w-full px-4 py-3 rounded-lg text-white placeholder-blue-200/50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full glass-button text-white px-6 py-3 rounded-lg font-medium web3-glow disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span className="ml-2">
              {sending ? "Sending..." : "Send on Sapphire"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PremiumMessageForm;
