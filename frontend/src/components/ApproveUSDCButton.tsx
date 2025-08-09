import React, { useState } from 'react'
import { CheckCircle, Clock } from 'lucide-react'

interface ApproveUSDCButtonProps {
  amount: number
  onApproved: () => void
}

const ApproveUSDCButton: React.FC<ApproveUSDCButtonProps> = ({ amount, onApproved }) => {
  const [isApproving, setIsApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    
    try {
      // Mock implementation - in real app, this would call USDC approve function
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsApproved(true)
      onApproved()
    } catch (error) {
      console.error('Failed to approve USDC:', error)
      alert('Failed to approve USDC. Please try again.')
    } finally {
      setIsApproving(false)
    }
  }

  if (isApproved) {
    return (
      <button
        disabled
        className="w-full glass text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium"
      >
        <CheckCircle className="h-5 w-5 text-green-400" />
        <span>USDC Approved</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleApprove}
      disabled={isApproving}
      className="w-full glass-button text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium"
    >
      {isApproving ? (
        <>
          <Clock className="h-5 w-5 animate-spin" />
          <span>Approving...</span>
        </>
      ) : (
        <span>Approve {amount} USDC</span>
      )}
    </button>
  )
}

export default ApproveUSDCButton
