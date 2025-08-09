import React from 'react'
import { Star, MessageCircle, DollarSign, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

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

interface ExpertCardProps {
  expert: Expert
  onBuyCredits: () => void
}

const ExpertCard: React.FC<ExpertCardProps> = ({ expert, onBuyCredits }) => {
  return (
    <div className="glass-card p-6 rounded-xl hover:scale-105 hover:web3-glow transition-all duration-300">
      <div className="flex items-center mb-4">
        <div className="relative">
          <img
            src={expert.avatar}
            alt={expert.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-400/30"
          />
          <div className="absolute -bottom-1 -right-1 glass p-1 rounded-full">
            <Shield className="h-4 w-4 text-blue-400" />
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-white">{expert.name}</h3>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-blue-200/80 text-sm">{expert.rating}</span>
            <span className="text-blue-200/60 text-sm">({expert.totalMessages})</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {expert.expertise.map((skill, index) => (
            <span
              key={index}
              className="glass px-2 py-1 rounded-full text-xs text-blue-200/80 border border-blue-400/20"
            >
              {skill}
            </span>
          ))}
        </div>
        <p className="text-blue-200/70 text-sm leading-relaxed">{expert.description}</p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-green-400" />
          <span className="text-white font-medium">{expert.pricePerMessage} USDC</span>
          <span className="text-blue-200/60 text-sm">per message</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <Link
          to={`/chat/${expert.id}`}
          className="flex-1 glass-button text-white px-4 py-2 rounded-lg text-center flex items-center justify-center space-x-2 web3-glow"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Chat</span>
        </Link>
        <button
          onClick={onBuyCredits}
          className="glass-button text-white px-4 py-2 rounded-lg flex items-center space-x-2 web3-glow"
        >
          <DollarSign className="h-4 w-4" />
          <span>Buy</span>
        </button>
      </div>
    </div>
  )
}

export default ExpertCard
