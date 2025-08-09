import React, { useState } from 'react'
import { Star, MessageCircle, DollarSign, Plus, UserPlus } from 'lucide-react'
import ExpertCard from '../components/ExpertCard'
import BuyCreditsForm from '../components/BuyCreditsForm'
import ArtistRegistrationForm from '../components/ArtistRegistrationForm'
import { useWallet } from '../contexts/WalletContext'

interface Expert {
  id: string
  name: string
  avatar: string
  expertise: string[]
  rating: number
  pricePerMessage: number
  description: string
  totalMessages: number
}

const Experts: React.FC = () => {
  const { isConnected } = useWallet()
  const [showBuyCredits, setShowBuyCredits] = useState(false)
  const [showArtistRegistration, setShowArtistRegistration] = useState(false)
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)

  // Mock data - in real app, this would come from blockchain
  const experts: Expert[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      expertise: ['DeFi', 'Smart Contracts', 'Tokenomics'],
      rating: 4.9,
      pricePerMessage: 50,
      description: 'Former Uniswap core developer with 5+ years in DeFi protocols and yield farming strategies',
      totalMessages: 1247
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      expertise: ['NFTs', 'Gaming', 'Metaverse'],
      rating: 4.8,
      pricePerMessage: 35,
      description: 'Gaming industry veteran and NFT marketplace founder specializing in Web3 gaming ecosystems',
      totalMessages: 892
    },
    {
      id: '3',
      name: 'Dr. Emily Watson',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      expertise: ['Research', 'Academia', 'Blockchain'],
      rating: 4.9,
      pricePerMessage: 75,
      description: 'PhD in Computer Science, published 50+ papers on blockchain consensus mechanisms and cryptography',
      totalMessages: 634
    },
    {
      id: '4',
      name: 'Alex Kim',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      expertise: ['Trading', 'TA', 'Risk Management'],
      rating: 4.7,
      pricePerMessage: 40,
      description: 'Professional DeFi trader with $100M+ in managed crypto assets and algorithmic trading expertise',
      totalMessages: 1456
    },
    {
      id: '5',
      name: 'Luna Martinez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      expertise: ['NFT Art', 'Digital Assets', 'Creator Economy'],
      rating: 4.8,
      pricePerMessage: 45,
      description: 'Digital artist and NFT creator with 10K+ pieces sold, specializing in generative art and Web3 monetization',
      totalMessages: 723
    },
    {
      id: '6',
      name: 'David Thompson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      expertise: ['DAO Governance', 'Tokenomics', 'Community'],
      rating: 4.9,
      pricePerMessage: 60,
      description: 'DAO architect and governance expert, helped launch 15+ successful DAOs with combined TVL of $500M+',
      totalMessages: 956
    }
  ]

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 rounded-xl text-center web3-glow">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Web3 Wallet</h2>
          <p className="text-blue-200/80">Please connect your wallet to access the expert network</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Web3 <span className="gradient-text">Expert Network</span>
            </h1>
            <p className="text-blue-200/80">Connect with verified experts across DeFi, NFTs, and blockchain domains</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowArtistRegistration(true)}
              className="glass-button text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium web3-glow"
            >
              <UserPlus className="h-5 w-5" />
              <span>Register as Expert</span>
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
                setSelectedExpert(expert)
                setShowBuyCredits(true)
              }}
            />
          ))}
        </div>

        {showBuyCredits && (
          <BuyCreditsForm
            expert={selectedExpert}
            onClose={() => {
              setShowBuyCredits(false)
              setSelectedExpert(null)
            }}
          />
        )}

        {showArtistRegistration && (
          <ArtistRegistrationForm
            onClose={() => setShowArtistRegistration(false)}
          />
        )}
      </div>
    </div>
  )
}

export default Experts
