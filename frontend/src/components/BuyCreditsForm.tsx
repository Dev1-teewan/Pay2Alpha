import React, { useState } from 'react'
import { X, DollarSign, CreditCard, Zap } from 'lucide-react'
import ApproveUSDCButton from './ApproveUSDCButton'

interface Expert {
  id: string
  name: string
  pricePerMessage: number
}

interface BuyCreditsFormProps {
  expert: Expert | null
  onClose: () => void
}

const BuyCreditsForm: React.FC<BuyCreditsFormProps> = ({ expert, onClose }) => {
  const [credits, setCredits] = useState(1)
  const [isApproved, setIsApproved] = useState(false)

  const totalCost = expert ? credits * expert.pricePerMessage : 0

  const handleBuyCredits = async () => {
    if (!expert || !isApproved) return
    
    try {
      // Mock implementation - in real app, this would call the smart contract
      console.log(`Buying ${credits} credits for expert ${expert.id}`)
      alert(`Successfully purchased ${credits} credits for ${expert.name}!`)
      onClose()
    } catch (error) {
      console.error('Failed to buy credits:', error)
      alert('Failed to buy credits. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="glass-card p-6 rounded-xl max-w-md w-full web3-glow">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="glass p-2 rounded-full">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Buy Credits</h2>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200/60 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {expert && (
          <div className="mb-6">
            <div className="glass p-4 rounded-lg mb-4 web3-glow">
              <h3 className="text-white font-medium mb-1">{expert.name}</h3>
              <p className="text-blue-200/70 text-sm">{expert.pricePerMessage} USDC per message unlock</p>
            </div>

            <div className="mb-4">
              <label className="block text-blue-200/80 text-sm font-medium mb-2">
                Number of Credits
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={credits}
                onChange={(e) => setCredits(Math.max(1, parseInt(e.target.value) || 1))}
                className="glass-input w-full px-4 py-2 rounded-lg text-white placeholder-blue-200/50"
              />
              <p className="text-blue-200/60 text-xs mt-1">
                Each credit unlocks one premium message
              </p>
            </div>

            <div className="glass p-4 rounded-lg mb-6 web3-glow">
              <div className="flex justify-between items-center">
                <span className="text-blue-200/80">Total Cost:</span>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <span className="text-white font-bold">{totalCost} USDC</span>
                </div>
              </div>
              <div className="text-blue-200/60 text-xs mt-1">
                Powered by Base network for fast, low-cost transactions
              </div>
            </div>

            <div className="space-y-3">
              <ApproveUSDCButton
                amount={totalCost}
                onApproved={() => setIsApproved(true)}
              />
              
              <button
                onClick={handleBuyCredits}
                disabled={!isApproved}
                className={`w-full px-4 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium transition-all ${
                  isApproved
                    ? 'glass-button text-white web3-glow'
                    : 'glass-dark text-blue-200/50 cursor-not-allowed'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span>Buy {credits} Credit{credits > 1 ? 's' : ''}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BuyCreditsForm
