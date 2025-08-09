import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Lock, Eye, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ChatComposer from "../components/ChatComposer";
import MessageList from "../components/MessageList";
import { ethers, type InterfaceAbi, Signature } from "ethers";
import SapphireChatAbi from "../abis/SapphireChatRecords.json";
import { CONFIG } from "../config";
import Pay2AlphaAbi from "../abis/Pay2Alpha.json";
import { useWallet } from "../contexts/WalletContext";
import * as sapphire from "@oasisprotocol/sapphire-paratime";
import { buildSIWEMessage, signSIWEMessage } from "../utils/siwe";
import { ensureChain } from "../utils/providers";

interface Message {
  id: string;
  sender: "expert" | "client";
  content: string;
  timestamp: Date;
  isEncrypted: boolean;
  isRevealed: boolean;
  cost?: number;
}

const Chat: React.FC = () => {
  const { expertId } = useParams();
  const { signer } = useWallet();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const [userCredits, setUserCredits] = useState(0);

  // Expert display state (fetched from Base Pay2Alpha)
  const [expertName, setExpertName] = useState<string>("");
  const [expertPrice, setExpertPrice] = useState<number>(50);
  const expert = {
    id: expertId,
    name:
      expertName ||
      (expertId
        ? `${expertId.slice(0, 6)}...${expertId.slice(-4)}`
        : "Unknown"),
    avatar: `https://api.dicebear.com/9.x/identicon/svg?seed=${
      expertId ?? "unknown"
    }`,
    expertise: ["DeFi", "Smart Contracts", "Tokenomics"],
    status: "online",
    pricePerMessage: expertPrice,
  };

  // Persist-reveal helpers (local-only, until on-chain reveal is wired)
  const revealedKey = expertId
    ? `revealed:${CONFIG.sapphire.chainId}:${CONFIG.sapphire.chat}:${expertId}`
    : "";
  const loadRevealed = (): Set<string> => {
    try {
      if (!revealedKey) return new Set();
      const raw = localStorage.getItem(revealedKey);
      if (!raw) return new Set();
      const arr: string[] = JSON.parse(raw);
      return new Set(arr);
    } catch {
      return new Set();
    }
  };
  const saveRevealed = (s: Set<string>) => {
    try {
      if (!revealedKey) return;
      localStorage.setItem(revealedKey, JSON.stringify(Array.from(s)));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!expertId) return;
      try {
        setLoading(true);
        // Read from Sapphire via a public JSON-RPC provider (no wallet switch needed)
        const provider = new ethers.JsonRpcProvider(
          CONFIG.sapphire.rpcUrl,
          undefined,
          { staticNetwork: true }
        );

        const importedAbi = SapphireChatAbi as unknown;
        const abi: InterfaceAbi = Array.isArray(importedAbi)
          ? (importedAbi as InterfaceAbi)
          : (importedAbi as { abi: InterfaceAbi }).abi;
        const c = new ethers.Contract(CONFIG.sapphire.chat, abi, provider);

        const total: bigint = await c.recordCount();
        const items: Message[] = [];
        const expAddr = ethers.getAddress(expertId);
        const revealed = loadRevealed();
        for (let i = 0n; i < total; i++) {
          const rec = await c.records(i);
          const recExpert: string = rec[0];
          // const recClient: string = rec[1];
          const ipfsCid: string = rec[2];
          const ts: bigint = rec[4];
          if (ethers.getAddress(recExpert) !== expAddr) continue;
          // Show all records for this artist, irrespective of client
          const idStr = String(i);
          items.push({
            id: idStr,
            sender: "expert",
            content: ipfsCid, // We use CID as the plaintext message for now
            timestamp: new Date(Number(ts) * 1000),
            isEncrypted: true,
            isRevealed: revealed.has(idStr),
          });
        }
        // Sort by time asc
        items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        setMessages(items);

        // Fetch expert profile and user credits from Base network
        try {
          const baseProvider = new ethers.JsonRpcProvider(
            CONFIG.base.rpcUrl,
            undefined,
            { staticNetwork: true }
          );
          const payImported = Pay2AlphaAbi as unknown;
          const payAbi: InterfaceAbi = Array.isArray(payImported)
            ? (payImported as InterfaceAbi)
            : (payImported as { abi: InterfaceAbi }).abi;
          const pay = new ethers.Contract(
            CONFIG.base.pay2alpha,
            payAbi,
            baseProvider
          );

          const expAddr = ethers.getAddress(expertId);
          const info = await pay.experts(expAddr);
          if (info) {
            if (info.name && info.name.length > 0) setExpertName(info.name);
            if (info.pricePerCredit) {
              setExpertPrice(Number(info.pricePerCredit) / 1_000_000);
            }
          }

          // Compute user credits (sum of purchases for this expert - used)
          let credits = 0;
          if (signer) {
            const me = await signer.getAddress();
            const totalRecs: bigint = await pay.recordCount();
            for (let j = 0n; j < totalRecs; j++) {
              const r = await pay.records(j);
              if (
                ethers.getAddress(r.expert) === expAddr &&
                ethers.getAddress(r.client) === ethers.getAddress(me)
              ) {
                const avail = Number(r.credits - r.creditsUsed);
                credits += avail;
              }
            }
          }
          setUserCredits(credits);
        } catch (err) {
          // Non-fatal for chat rendering
          console.warn("Failed to load expert profile/credits", err);
        }
      } catch (e) {
        console.error("Failed to load records", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [expertId, signer]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "client",
      content,
      timestamp: new Date(),
      isEncrypted: false,
      isRevealed: true,
    };
    setMessages([...messages, newMessage]);
  };

  const handleRevealMessage = async (messageId: string, cost: number) => {
    try {
      if (!signer) throw new Error("Connect wallet");
      if (userCredits < cost) {
        alert(
          "Insufficient credits! Please purchase more credits to reveal this message."
        );
        return;
      }

      // 1) Spend 1 credit on Base against any available record for this expert
      await ensureChain(CONFIG.base.chainHex);
      const payAbi: InterfaceAbi = Array.isArray(Pay2AlphaAbi as unknown)
        ? (Pay2AlphaAbi as unknown as InterfaceAbi)
        : (Pay2AlphaAbi as unknown as { abi: InterfaceAbi }).abi;
      const pay = new ethers.Contract(CONFIG.base.pay2alpha, payAbi, signer);
      const me = await signer.getAddress();
      const expAddr = expertId
        ? ethers.getAddress(expertId)
        : ethers.ZeroAddress;
      const totalRecs: bigint = await pay.recordCount();
      let chosen: bigint | null = null;
      for (let j = 0n; j < totalRecs; j++) {
        const r = await pay.records(j);
        if (
          ethers.getAddress(r.expert) === expAddr &&
          ethers.getAddress(r.client) === ethers.getAddress(me)
        ) {
          const avail = r.credits - r.creditsUsed;
          if (avail > 0n) {
            chosen = j;
            break;
          }
        }
      }
      if (chosen === null) {
        alert("No available credits found for this expert.");
        return;
      }
      const spendTx = await pay.spendCredits(chosen, 1n);
      await spendTx.wait();

      // 2) Switch to Sapphire + SIWE + getSecretKey
      await ensureChain(CONFIG.sapphire.chainHex);
      const wrapped = sapphire.wrapEthersProvider((window as any).ethereum);
      const sapphireProvider = new ethers.BrowserProvider(wrapped);
      const sapphireSigner = await sapphireProvider.getSigner();
      const addr = await sapphireSigner.getAddress();
      const nonce = Math.random().toString(36).slice(2, 10);
      const siwe = buildSIWEMessage(addr, nonce);
      const sigHex = await signSIWEMessage(siwe, sapphireSigner);
      const sig = Signature.from(sigHex);

      const importedAbi = SapphireChatAbi as unknown;
      const chatAbi: InterfaceAbi = Array.isArray(importedAbi)
        ? (importedAbi as InterfaceAbi)
        : (importedAbi as { abi: InterfaceAbi }).abi;
      const chat = new ethers.Contract(
        CONFIG.sapphire.chat,
        chatAbi,
        sapphireSigner
      );
      const token: string = await chat.login(siwe, {
        v: sig.v,
        r: sig.r,
        s: sig.s,
      });
      // Confirm access by attempting to fetch secret; ignore the value for now
      await chat.getSecretKey(BigInt(messageId), token);

      // 3) Reveal in UI and persist
      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === messageId ? { ...m, isRevealed: true } : m
        );
        const revealed = loadRevealed();
        revealed.add(messageId);
        saveRevealed(revealed);
        return next;
      });
      setUserCredits((prev) => prev - cost);
    } catch (e) {
      console.error(e);
      alert(
        "Reveal failed. Ensure you have credits and are authorized as the client."
      );
    }
  };

  const encryptedMessages = messages.filter(
    (msg) => msg.isEncrypted && !msg.isRevealed
  );

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chat */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-xl overflow-hidden web3-glow">
              {/* Chat Header */}
              <div className="glass border-b border-blue-400/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/experts"
                      className="text-blue-200/60 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <img
                      src={expert.avatar}
                      alt={expert.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-400/20"
                    />
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {expert.name}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full pulse-blue"></div>
                        <span className="text-blue-200/70 text-sm">Online</span>
                        <span className="text-blue-200/50 text-sm">•</span>
                        <span className="text-blue-200/70 text-sm">
                          ${expert.pricePerMessage}/msg
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="glass px-4 py-2 rounded-full web3-glow">
                      <span className="text-white font-medium">
                        Credits: {userCredits}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {loading && (
                  <div className="text-blue-200/70 text-sm">
                    Loading records from Sapphire…
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "client"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.sender === "client"
                          ? "glass-button text-white web3-glow"
                          : message.isRevealed
                          ? "glass text-white"
                          : "glass-dark text-blue-200/50 border-dashed"
                      }`}
                    >
                      {message.isEncrypted && !message.isRevealed ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Lock className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-blue-200/80">
                              Encrypted Premium Message
                            </span>
                          </div>
                          <div className="text-xs text-blue-200/60">
                            This message contains valuable insights about{" "}
                            {expert.expertise.join(", ")}
                          </div>
                          <button
                            onClick={() =>
                              handleRevealMessage(
                                message.id,
                                message.cost || expert.pricePerMessage
                              )
                            }
                            disabled={
                              userCredits <
                              (message.cost || expert.pricePerMessage)
                            }
                            className="w-full glass-button px-3 py-2 rounded text-sm flex items-center justify-center space-x-2 web3-glow disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Eye className="h-4 w-4" />
                            <span>
                              Reveal for{" "}
                              {message.cost || expert.pricePerMessage} credits
                            </span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                      )}
                      <div className="text-xs text-blue-200/50 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="glass border-t border-blue-400/20 p-4">
                <ChatComposer onSendMessage={handleSendMessage} />
              </div>
            </div>
          </div>

          {/* Message List Sidebar */}
          <div className="lg:col-span-1">
            <MessageList
              expertId={expertId || ""}
              encryptedMessages={encryptedMessages}
              onRevealMessage={handleRevealMessage}
              userCredits={userCredits}
              expertPrice={expert.pricePerMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
