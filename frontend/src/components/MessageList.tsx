import React from 'react'
import { Eye, Clock, Lock, MessageSquare, DollarSign } from 'lucide-react'

interface Message {
  id: string
  sender: 'expert' | 'client'
  content: string
  timestamp: Date
  isEncrypted: boolean
  isRevealed: boolean
  cost?: number
}

interface MessageListProps {
  expertId: string
  encryptedMessages: Message[]
  onRevealMessage: (messageId: string, cost: number) => void
  userCredits: number
  expertPrice: number
}

const MessageList: React.FC<MessageListProps> = ({ 
  expertId, 
  encryptedMessages, 
  onRevealMessage, 
  userCredits, 
  expertPrice 
}) => {
  const totalValue = encryptedMessages.reduce((sum, msg) => sum + (msg.cost || expertPrice), 0)

  return (
    <div className="space-y-6">
      {/* Credits Status */}
      <div className="glass-card p-4 rounded-xl web3-glow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Your Credits</h3>
          <div className="glass px-3 py-1 rounded-full">
            <span className="text-white font-medium">{userCredits}</span>
          </div>
        </div>
        <div className="text-blue-200/80 text-sm">
          Available to unlock {Math.floor(userCredits / expertPrice)} messages
        </div>
      </div>

      {/* Encrypted Messages */}
      <div className="glass-card p-4 rounded-xl web3-glow">
        <div className="flex items-center space-x-2 mb-4">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Premium Messages</h3>
        </div>
        
        {encryptedMessages.length === 0 ? (
          <div className="text-center py-6">
            <Lock className="h-8 w-8 text-blue-400/50 mx-auto mb-2" />
            <p className="text-blue-200/60 text-sm">No encrypted messages available</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="glass p-3 rounded-lg mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-200/80">Total Value:</span>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-white font-medium">{totalValue} credits</span>
                </div>
              </div>
            </div>

            {encryptedMessages.map((message) => (
              <div key={message.id} className="glass p-4 rounded-lg border border-blue-400/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Premium Insight</p>
                      <div className="flex items-center space-x-2 text-blue-200/60 text-xs mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{message.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-blue-400 text-sm font-medium">
                    {message.cost || expertPrice} credits
                  </div>
                </div>
                
                <div className="text-blue-200/70 text-xs mb-3 italic">
                  "This message contains valuable insights about DeFi strategies and risk management..."
                </div>
                
                <button
                  onClick={() => onRevealMessage(message.id, message.cost || expertPrice)}
                  disabled={userCredits < (message.cost || expertPrice)}
                  className="w-full glass-button text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-2 web3-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="h-4 w-4" />
                  <span>
                    {userCredits < (message.cost || expertPrice) 
                      ? 'Insufficient Credits' 
                      : 'Reveal Message'
                    }
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purchase More Credits */}
      <div className="glass-card p-4 rounded-xl web3-glow">
        <h3 className="text-lg font-semibold text-white mb-2">Need More Credits?</h3>
        <p className="text-blue-200/80 text-sm mb-3">
          Purchase additional credits to unlock more premium messages
        </p>
        <button className="w-full glass-button text-white px-4 py-2 rounded-lg font-medium web3-glow">
          Buy Credits
        </button>
      </div>
    </div>
  )
}

export default MessageList
