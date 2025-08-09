import React from 'react'
import { Wallet } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'

const ConnectButton: React.FC = () => {
  const { account, isConnected, connectWallet, disconnectWallet } = useWallet()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnected && account) {
    return (
      <button
        onClick={disconnectWallet}
        className="glass-button text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium"
      >
        <Wallet className="h-4 w-4" />
        <span>{formatAddress(account)}</span>
      </button>
    )
  }

  return (
    <button
      onClick={connectWallet}
      className="glass-button text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium"
    >
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </button>
  )
}

export default ConnectButton
