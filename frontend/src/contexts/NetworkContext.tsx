import React, { createContext, useContext, useState, ReactNode } from 'react'

type Network = 'base' | 'sapphire'

interface NetworkContextType {
  currentNetwork: Network
  switchNetwork: (network: Network) => Promise<void>
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

export const useNetwork = () => {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
}

interface NetworkProviderProps {
  children: ReactNode
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [currentNetwork, setCurrentNetwork] = useState<Network>('base')

  const switchNetwork = async (network: Network) => {
    try {
      if (network === 'base') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }], // Base mainnet
        })
      } else if (network === 'sapphire') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x5afe' }], // Sapphire mainnet
        })
      }
      setCurrentNetwork(network)
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  return (
    <NetworkContext.Provider value={{
      currentNetwork,
      switchNetwork
    }}>
      {children}
    </NetworkContext.Provider>
  )
}
