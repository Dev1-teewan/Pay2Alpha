import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Send, Lock, Eye, EyeOff, ArrowLeft, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import ChatComposer from '../components/ChatComposer'
import MessageList from '../components/MessageList'

interface Message {
  id: string
  sender: 'expert' | 'client'
  content: string
  timestamp: Date
  isEncrypted: boolean
  isRevealed: boolean
  cost?: number
}

const Chat: React.FC = () => {
  const { expertId } = useParams()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'expert',
      content: 'Hello! I see you\'re interested in DeFi protocols. What specific area would you like to explore?',
      timestamp: new Date(Date.now() - 3600000),
      isEncrypted: true,
      isRevealed: false,
      cost: 50
    },
    {
      id: '2',
      sender: 'client',
      content: 'I\'m looking to understand yield farming strategies and their risks.',
      timestamp: new Date(Date.now() - 3000000),
      isEncrypted: false,
      isRevealed: true
    },
    {
      id: '3',
      sender: 'expert',
      content: 'Great question! Yield farming involves several key strategies: liquidity provision, staking rewards, and protocol incentives. The main risks include impermanent loss, smart contract vulnerabilities, and token price volatility. Let me break down each strategy with specific examples from Uniswap V3, Compound, and Aave...',
      timestamp: new Date(Date.now() - 1800000),
      isEncrypted: true,
      isRevealed: false,
      cost: 50
    },
    {
      id: '4',
      sender: 'expert',
      content: 'For advanced yield farming, consider these strategies: 1) Delta-neutral farming using perpetual futures, 2) Leveraged liquidity provision with protocols like Alpha Homora, 3) Cross-chain yield optimization. Each has different risk/reward profiles that I can explain in detail.',
      timestamp: new Date(Date.now() - 900000),
      isEncrypted: true,
      isRevealed: false,
      cost: 50
    },
    {
      id: '5',
      sender: 'expert',
      content: 'Here\'s a practical example: Using Curve Finance for stablecoin farming. You can provide liquidity to 3pool (USDC/USDT/DAI), stake the LP tokens in Convex for boosted CRV rewards, and hedge impermanent loss with options. Current APY is around 8-12% with proper optimization.',
      timestamp: new Date(Date.now() - 300000),
      isEncrypted: true,
      isRevealed: false,
      cost: 50
    }
  ])

  const [userCredits, setUserCredits] = useState(5)

  // Mock expert data
  const expert = {
    id: expertId,
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    expertise: ['DeFi', 'Smart Contracts', 'Tokenomics'],
    status: 'online',
    pricePerMessage: 50
  }

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'client',
      content,
      timestamp: new Date(),
      isEncrypted: false,
      isRevealed: true
    }
    setMessages([...messages, newMessage])
  }

  const handleRevealMessage = (messageId: string, cost: number) => {
    if (userCredits < cost) {
      alert('Insufficient credits! Please purchase more credits to reveal this message.')
      return
    }

    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, isRevealed: true } : msg
    ))
    setUserCredits(prev => prev - cost)
  }

  const encryptedMessages = messages.filter(msg => msg.isEncrypted && !msg.isRevealed)

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
                      <h2 className="text-xl font-semibold text-white">{expert.name}</h2>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full pulse-blue"></div>
                        <span className="text-blue-200/70 text-sm">Online</span>
                        <span className="text-blue-200/50 text-sm">•</span>
                        <span className="text-blue-200/70 text-sm">${expert.pricePerMessage}/msg</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="glass px-4 py-2 rounded-full web3-glow">
                      <span className="text-white font-medium">Credits: {userCredits}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.sender === 'client'
                          ? 'glass-button text-white web3-glow'
                          : message.isRevealed
                          ? 'glass text-white'
                          : 'glass-dark text-blue-200/50 border-dashed'
                      }`}
                    >
                      {message.isEncrypted && !message.isRevealed ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Lock className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-blue-200/80">Encrypted Premium Message</span>
                          </div>
                          <div className="text-xs text-blue-200/60">
                            This message contains valuable insights about {expert.expertise.join(', ')}
                          </div>
                          <button
                            onClick={() => handleRevealMessage(message.id, message.cost || expert.pricePerMessage)}
                            disabled={userCredits < (message.cost || expert.pricePerMessage)}
                            className="w-full glass-button px-3 py-2 rounded text-sm flex items-center justify-center space-x-2 web3-glow disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Reveal for {message.cost || expert.pricePerMessage} credits</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
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
              expertId={expertId || ''} 
              encryptedMessages={encryptedMessages}
              onRevealMessage={handleRevealMessage}
              userCredits={userCredits}
              expertPrice={expert.pricePerMessage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
