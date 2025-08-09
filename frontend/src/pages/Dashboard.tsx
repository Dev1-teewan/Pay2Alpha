import React, { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Users,
  MessageCircle,
  DollarSign,
  Activity,
  Award,
} from "lucide-react";
import ClaimButton from "../components/ClaimButton";
import RefundButton from "../components/RefundButton";
import { ethers, type InterfaceAbi } from "ethers";
import { CONFIG } from "../config";
import Pay2AlphaAbi from "../abis/Pay2Alpha.json";
import { useWallet } from "../contexts/WalletContext";

const Dashboard: React.FC = () => {
  const { signer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCredits: 0,
    usedCredits: 0,
    totalSpent: 0,
    expertsConnected: 0,
    messagesExchanged: 0,
    avgRating: 0,
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: "1",
      type: "message",
      description: "Revealed message from Sarah Chen",
      timestamp: new Date(Date.now() - 1800000),
      cost: 50,
    },
    {
      id: "2",
      type: "purchase",
      description: "Purchased 10 credits",
      timestamp: new Date(Date.now() - 3600000),
      cost: 350,
    },
    {
      id: "3",
      type: "message",
      description: "Revealed message from Marcus Rodriguez",
      timestamp: new Date(Date.now() - 7200000),
      cost: 35,
    },
  ]);

  const [topExperts, setTopExperts] = useState([
    {
      name: "Sarah Chen",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
      messagesExchanged: 8,
      totalSpent: 400,
    },
    {
      name: "Dr. Emily Watson",
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=50&h=50&fit=crop&crop=face",
      messagesExchanged: 5,
      totalSpent: 375,
    },
    {
      name: "Alex Kim",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
      messagesExchanged: 12,
      totalSpent: 480,
    },
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const base = new ethers.JsonRpcProvider(CONFIG.base.rpcUrl, undefined, {
          staticNetwork: true,
        });
        const imported = Pay2AlphaAbi as unknown;
        const abi: InterfaceAbi = Array.isArray(imported)
          ? (imported as InterfaceAbi)
          : (imported as { abi: InterfaceAbi }).abi;
        const pay = new ethers.Contract(CONFIG.base.pay2alpha, abi, base);

        // Aggregate credits and expert list for the connected user if available
        let totalCredits = 0;
        let usedCredits = 0;
        let expertsConnected = 0;
        if (signer) {
          const me = await signer.getAddress();
          const n: bigint = await pay.recordCount();
          const expertSet = new Set<string>();
          for (let i = 0n; i < n; i++) {
            const r = await pay.records(i);
            if (ethers.getAddress(r.client) !== ethers.getAddress(me)) continue;
            expertSet.add(ethers.getAddress(r.expert));
            totalCredits += Number(r.credits);
            usedCredits += Number(r.creditsUsed);
          }
          expertsConnected = expertSet.size;
        }
        setStats((s) => ({
          ...s,
          totalCredits,
          usedCredits,
          expertsConnected,
        }));

        // Optional: fetch expert catalog for top experts from on-chain list
        try {
          const totalExperts: number = Number(await pay.expertsCount());
          const limit = Math.min(totalExperts, 5);
          const items: {
            name: string;
            avatar: string;
            messagesExchanged: number;
            totalSpent: number;
          }[] = [];
          if (limit > 0) {
            const [addrs, infos] = await pay.getExperts(0, limit);
            for (let i = 0; i < addrs.length; i++) {
              items.push({
                name:
                  infos[i].name ||
                  `${addrs[i].slice(0, 6)}...${addrs[i].slice(-4)}`,
                avatar: `https://api.dicebear.com/9.x/identicon/svg?seed=${addrs[i]}`,
                messagesExchanged: 0,
                totalSpent: 0,
              });
            }
            setTopExperts(items);
          }
        } catch {}
      } catch (e) {
        // keep mock defaults if chain not reachable
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [signer]);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/70">
              Track your mentorship journey and manage credits
            </p>
          </div>
          <div className="flex space-x-3">
            <ClaimButton />
            <RefundButton />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Available Credits</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalCredits - stats.usedCredits}
                </p>
              </div>
              <div className="glass p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Total Spent</p>
                <p className="text-2xl font-bold text-white">
                  ${stats.usedCredits}
                </p>
              </div>
              <div className="glass p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Experts Connected</p>
                <p className="text-2xl font-bold text-white">
                  {stats.expertsConnected}
                </p>
              </div>
              <div className="glass p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Messages Exchanged</p>
                <p className="text-2xl font-bold text-white">
                  {stats.messagesExchanged}
                </p>
              </div>
              <div className="glass p-3 rounded-full">
                <MessageCircle className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Average Rating</p>
                <p className="text-2xl font-bold text-white">
                  {stats.avgRating}
                </p>
              </div>
              <div className="glass p-3 rounded-full">
                <Award className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Credits Used</p>
                <p className="text-2xl font-bold text-white">
                  {stats.usedCredits}/{stats.totalCredits}
                </p>
              </div>
              <div className="glass p-3 rounded-full">
                <Activity className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="glass p-4 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        activity.type === "message"
                          ? "bg-blue-400"
                          : "bg-green-400"
                      }`}
                    ></div>
                    <div>
                      <p className="text-white text-sm">
                        {activity.description}
                      </p>
                      <p className="text-white/60 text-xs">
                        {activity.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-white/80 text-sm font-medium">
                    ${activity.cost}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Experts */}
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">
              Top Experts
            </h2>
            <div className="space-y-4">
              {topExperts.map((expert, index) => (
                <div
                  key={index}
                  className="glass p-4 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={expert.avatar}
                      alt={expert.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {expert.name}
                      </p>
                      <p className="text-white/60 text-xs">
                        {expert.messagesExchanged} messages
                      </p>
                    </div>
                  </div>
                  <div className="text-white/80 text-sm font-medium">
                    ${expert.totalSpent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
