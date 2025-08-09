import React, { useState } from 'react'
import { Gift, Clock } from 'lucide-react'

const ClaimButton: React.FC = () => {
  const [isClaiming, setIsClaiming] = useState(false)
  const [availableToClaim] = useState(150) // Mock earnings

  const handleClaim = async () => {
    setIsClaiming(true)
    
    try {
      // Mock implementation - in real app, this would call the smart contract
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert(`Successfully claimed ${availableToClaim} USDC!`)
    } catch (error) {
      console.error('Failed to claim:', error)
      alert('Failed to claim earnings. Please try again.')
    } finally {
      setIsClaiming(false)
    }
  }

  if (availableToClaim === 0) {
    return null
  }

  return (
    <button
      onClick={handleClaim}
      disabled={isClaiming}
      className="glass-button text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium"
    >
      {isClaiming ? (
        <>
          <Clock className="h-4 w-4 animate-spin" />
          <span>Claiming...</span>
        </>
      ) : (
        <>
          <Gift className="h-4 w-4" />
          <span>Claim ${availableToClaim}</span>
        </>
      )}
    </button>
  )
}

export default ClaimButton
