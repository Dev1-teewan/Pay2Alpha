import React, { useState } from 'react'
import { RotateCcw, Clock } from 'lucide-react'

const RefundButton: React.FC = () => {
  const [isRefunding, setIsRefunding] = useState(false)
  const [unusedCredits] = useState(13) // Mock unused credits

  const handleRefund = async () => {
    setIsRefunding(true)
    
    try {
      // Mock implementation - in real app, this would call the smart contract
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`Successfully refunded ${unusedCredits} unused credits!`)
    } catch (error) {
      console.error('Failed to refund:', error)
      alert('Failed to refund credits. Please try again.')
    } finally {
      setIsRefunding(false)
    }
  }

  if (unusedCredits === 0) {
    return null
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
          <span>Refund {unusedCredits} Credits</span>
        </>
      )}
    </button>
  )
}

export default RefundButton
